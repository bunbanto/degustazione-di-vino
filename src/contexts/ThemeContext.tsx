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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Always use light theme on homepage
  const isHomePage = pathname === "/";

  useEffect(() => {
    // On homepage, always use light theme
    if (isHomePage) {
      setTheme("light");
      setMounted(true);
      return;
    }

    // Check for saved theme preference or system preference (non-homepage pages)
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    setMounted(true);
  }, [isHomePage]);

  useEffect(() => {
    if (!mounted) return;

    // Always remove dark class on homepage
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

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="min-h-screen bg-amber-50">{children}</div>;
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
