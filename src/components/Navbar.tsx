"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cacheUtils } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserStore } from "@/store/userStore";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, checkAuth, logout } = useUserStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, [checkAuth]);

  const handleLogout = () => {
    cacheUtils.clearAll();
    logout();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Loading state with liquid glass effect
  if (currentUser === undefined && !isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass-safe h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
          <div className="liquid-glass rounded-full p-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass-safe">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo with liquid glass effect */}
            <Link
              href="/"
              className="text-2xl font-serif font-bold text-rose-800 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 transition-all duration-300 liquid-glass px-4 py-2 rounded-2xl"
            >
              🍷 Degustazione
            </Link>

            {/* Desktop Navigation with glass buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/cards"
                className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 liquid-glass ${
                  pathname === "/cards"
                    ? "bg-rose-200/50 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                    : "hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-gray-600 dark:text-gray-300"
                }`}
              >
                Каталог вин
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/favorites"
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 liquid-glass ${
                      pathname === "/favorites"
                        ? "bg-rose-200/50 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                        : "hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Мої улюблені
                  </Link>
                  <Link
                    href="/add-card"
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 liquid-glass ${
                      pathname === "/add-card"
                        ? "bg-rose-200/50 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                        : "hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    Додати вино
                  </Link>
                </>
              ) : null}

              {/* Theme Toggle with liquid glass */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl liquid-glass text-rose-700 dark:text-amber-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label={
                  theme === "dark"
                    ? "Увімкнути світлу тему"
                    : "Увімкнути темну тему"
                }
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* Profile with liquid glass */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 liquid-glass px-3 py-2 rounded-2xl hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium shadow-lg">
                      {currentUser?.name?.[0]?.toUpperCase() ||
                        currentUser?.username?.[0]?.toUpperCase() ||
                        currentUser?.email?.[0].toUpperCase() ||
                        "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                      {currentUser?.name ||
                        currentUser?.username ||
                        currentUser?.email}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-2xl liquid-glass text-rose-700 dark:text-rose-400 font-medium hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Вийти
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-2xl liquid-btn-wine font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Увійти
                </Link>
              )}
            </div>

            {/* Mobile Menu Button with liquid glass */}
            <button
              className="md:hidden p-2.5 rounded-2xl liquid-glass text-gray-600 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu with liquid glass overlay */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-rose-200/30 dark:border-rose-800/30">
              <div className="flex flex-col gap-3">
                <Link
                  href="/cards"
                  className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Каталог вин
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/favorites"
                      className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Мої улюблені
                    </Link>
                    <Link
                      href="/add-card"
                      className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Додати вино
                    </Link>
                    <Link
                      href="/profile"
                      className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Мій профіль
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-2xl liquid-glass text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                    >
                      Вийти
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-3 rounded-2xl liquid-btn-wine text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Увійти
                  </Link>
                )}

                {/* Theme Toggle in Mobile Menu */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {theme === "dark" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    )}
                  </svg>
                  {theme === "dark" ? "Світла тема" : "Темна тема"}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Add spacer to account for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
