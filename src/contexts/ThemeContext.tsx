"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get initial theme from localStorage synchronously
function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem("theme") as Theme | null;
  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Read from localStorage synchronously to avoid flash
  const [theme, setTheme] = useState<Theme>(() => {
    // Homepage always uses light theme
    if (isHomePage) {
      return "light";
    }
    return getInitialTheme();
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to HTML element immediately on mount
  useEffect(() => {
    if (!mounted) return;

    // Always use light theme on homepage
    if (isHomePage) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      return;
    }

    // Apply theme to HTML element on other pages
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Save preference
    localStorage.setItem("theme", theme);
  }, [theme, mounted, isHomePage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent flash of wrong theme - render with correct theme immediately
  if (!mounted) {
    // Apply theme synchronously before render to prevent flash
    if (typeof window !== "undefined") {
      if (isHomePage) {
        document.documentElement.classList.remove("dark");
      } else {
        const currentTheme = getInitialTheme();
        if (currentTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default values if context is not available (during SSR or when not wrapped)
  if (context === undefined) {
    return { theme: "light", toggleTheme: () => {} };
  }
  return context;
}
