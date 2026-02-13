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

// Separate key for user preference that persists even on homepage
const THEME_PREFERENCE_KEY = "theme-preference";

function getUserThemePreference(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(THEME_PREFERENCE_KEY) as Theme | null;
}

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

  // Get user preference from localStorage
  const userPreference = getUserThemePreference();
  const initialTheme = userPreference || getInitialTheme();

  // Read from localStorage synchronously to avoid flash
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to HTML element and save preference
  useEffect(() => {
    if (!mounted) return;

    // Always use light theme on homepage, but save user preference separately
    if (isHomePage) {
      document.documentElement.classList.remove("dark");
      // Save user preference for when they leave homepage
      localStorage.setItem(THEME_PREFERENCE_KEY, theme);
      // Also save to main theme key for consistency
      localStorage.setItem("theme", theme);
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
    localStorage.setItem(THEME_PREFERENCE_KEY, theme);
  }, [theme, mounted, isHomePage]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent flash of wrong theme - render with correct theme immediately
  if (!mounted) {
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
