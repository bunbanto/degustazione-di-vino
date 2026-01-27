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
    // Перевіряємо авторизацію при завантаженні
    setIsAuthenticated(checkAuth());
  }, [checkAuth]);

  const handleLogout = () => {
    cacheUtils.clearAll();
    logout();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Показуємо loading поки перевіряємо auth
  if (currentUser === undefined && !isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-serif font-bold text-rose-800 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
          >
            🍷 Degustazione
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/cards"
              className={`font-medium transition-colors ${
                pathname === "/cards"
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              Каталог вин
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/favorites"
                  className={`font-medium transition-colors ${
                    pathname === "/favorites"
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                  }`}
                >
                  Мої улюблені
                </Link>
                <Link
                  href="/add-card"
                  className={`font-medium transition-colors ${
                    pathname === "/add-card"
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                  }`}
                >
                  Додати вино
                </Link>
              </>
            ) : null}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-rose-100 dark:bg-dark-700 text-rose-700 dark:text-amber-400 hover:bg-rose-200 dark:hover:bg-dark-600 transition-all"
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
                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-dark-700 rounded-full px-3 py-1 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
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
                  className="px-4 py-2 bg-rose-100 dark:bg-dark-700 text-rose-700 dark:text-rose-400 rounded-full font-medium hover:bg-rose-200 dark:hover:bg-dark-600 transition-colors"
                >
                  Вийти
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600 text-white rounded-full font-medium hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500 transition-all shadow-md"
              >
                Увійти
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-dark-700">
            <div className="flex flex-col gap-4">
              <Link
                href="/cards"
                className="font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Каталог вин
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/favorites"
                    className="font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Мої улюблені
                  </Link>
                  <Link
                    href="/add-card"
                    className="font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Додати вино
                  </Link>
                  <Link
                    href="/profile"
                    className="font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Мій профіль
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left font-medium text-rose-600 dark:text-rose-400"
                  >
                    Вийти
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="font-medium text-rose-600 dark:text-rose-400"
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
                className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
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
  );
}
