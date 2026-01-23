"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Get user email from localStorage
    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserEmail(user.email || "");
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserEmail("");
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-serif font-bold text-rose-800 hover:text-rose-700 transition-colors"
          >
            🍷 Degustazione
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/cards"
              className={`font-medium transition-colors ${
                pathname === "/cards"
                  ? "text-rose-700"
                  : "text-gray-600 hover:text-rose-600"
              }`}
            >
              Каталог вин
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/favorites"
                  className={`font-medium transition-colors ${
                    pathname === "/favorites"
                      ? "text-rose-700"
                      : "text-gray-600 hover:text-rose-600"
                  }`}
                >
                  Мої улюблені
                </Link>
                <Link
                  href="/add-card"
                  className={`font-medium transition-colors ${
                    pathname === "/add-card"
                      ? "text-rose-700"
                      : "text-gray-600 hover:text-rose-600"
                  }`}
                >
                  Додати вино
                </Link>
                <div className="flex items-center gap-3">
                  {userEmail && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {userEmail}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full font-medium hover:bg-rose-200 transition-colors"
                  >
                    Вийти
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-full font-medium hover:from-rose-700 hover:to-rose-600 transition-all shadow-md"
              >
                Увійти
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link
                href="/cards"
                className="font-medium text-gray-600 hover:text-rose-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Каталог вин
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/favorites"
                    className="font-medium text-gray-600 hover:text-rose-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Мої улюблені
                  </Link>
                  {userEmail && (
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                      {userEmail}
                    </div>
                  )}
                  <Link
                    href="/add-card"
                    className="font-medium text-gray-600 hover:text-rose-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Додати вино
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left font-medium text-rose-600"
                  >
                    Вийти
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="font-medium text-rose-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Увійти
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
