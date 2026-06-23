"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { authAPI, cacheUtils, clearAuthSession } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserStore } from "@/store/userStore";
import { SUPPORTED_LANGS, t, type Lang } from "@/i18n/i18n";
import { getLangFromPath, withLang } from "@/i18n/routeUtils";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = getLangFromPath(pathname);

  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, checkAuth, logout } = useUserStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      const hasCachedSession = checkAuth();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        logout();
        if (!cancelled) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      if (!cancelled) {
        setIsCheckingAuth(true);
        setIsAuthenticated(hasCachedSession);
      }

      try {
        const profileResp = await authAPI.getProfile();
        const profileData = (profileResp as any)?.user || profileResp;

        if (!profileData) {
          throw new Error("Profile response is empty");
        }

        const userData = {
          id: profileData.id || profileData._id,
          _id: profileData._id,
          name: profileData.name,
          username: profileData.username,
          email: profileData.email,
          role: profileData.role,
          createdAt: profileData.createdAt,
          cardCount: profileData.cardCount ?? 0,
          favoritesCount: profileData.favoritesCount ?? 0,
        };

        useUserStore.getState().setCurrentUser(userData);
        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch {
        clearAuthSession();
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAuth(false);
        }
      }
    };

    verifyAuth();

    const handleAuthChanged = () => {
      if (!localStorage.getItem("token")) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      }
    };

    window.addEventListener("auth:changed", handleAuthChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", handleAuthChanged);
    };
  }, [checkAuth, logout, pathname]);

  const handleLogout = () => {
    cacheUtils.clearAll();
    logout();
    setIsAuthenticated(false);
    window.location.assign(withLang("/", lang));
  };

  const hrefCards = withLang("/cards", lang);
  const hrefFavorites = withLang("/favorites", lang);
  const hrefAddCard = withLang("/add-card", lang);
  const hrefLogin = withLang("/login", lang);
  const hrefProfile = withLang("/profile", lang);

  const pathnameNoLang = (() => {
    const cleanPath = pathname.replace(/\/(uk|en|it)(\/|$)/, "$2");
    return cleanPath || "/";
  })();

  const getLanguageHref = (nextLang: Lang) => {
    const query = searchParams.toString();
    const href = withLang(pathnameNoLang, nextLang);
    return query ? `${href}?${query}` : href;
  };

  const languageSwitcher = (
    <div className="flex items-center gap-1 liquid-glass rounded-2xl p-1">
      {SUPPORTED_LANGS.map((item) => (
        <Link
          key={item}
          href={getLanguageHref(item)}
          hrefLang={item}
          aria-current={item === lang ? "true" : undefined}
          className={`min-w-9 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold uppercase transition-all duration-300 ${
            item === lang
              ? "bg-rose-600 text-white shadow-sm dark:bg-rose-500"
              : "text-gray-600 hover:bg-rose-100/60 dark:text-gray-300 dark:hover:bg-rose-900/30"
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          {item}
        </Link>
      ))}
    </div>
  );

  // Loading state with liquid glass effect
  if (isCheckingAuth && !currentUser) {
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
            <Link
              href={withLang("/", lang)}
              className="text-2xl font-serif font-bold text-rose-800 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 transition-all duration-300 liquid-glass px-4 py-2 rounded-2xl"
            >
              🍷 Degustazione
            </Link>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href={hrefCards}
                className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 liquid-glass ${
                  pathnameNoLang === "/cards"
                    ? "bg-rose-200/50 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                    : "hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-gray-600 dark:text-gray-300"
                }`}
              >
                {t(lang, "nav.catalog")}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href={hrefFavorites}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 liquid-glass ${
                      pathnameNoLang === "/favorites"
                        ? "bg-rose-200/50 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                        : "hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {t(lang, "nav.favorites")}
                  </Link>
                  <Link
                    href={hrefAddCard}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 liquid-glass ${
                      pathnameNoLang === "/add-card"
                        ? "bg-rose-200/50 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                        : "hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {t(lang, "nav.addWine")}
                  </Link>
                </>
              ) : null}

              {languageSwitcher}

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl liquid-glass text-rose-700 dark:text-amber-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label={
                  theme === "dark"
                    ? t(lang, "nav.theme.dark")
                    : t(lang, "nav.theme.light")
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
                  <Link
                    href={hrefProfile}
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
                    {t(lang, "nav.logout")}
                  </button>
                </div>
              ) : (
                <Link
                  href={hrefLogin}
                  className="px-6 py-2.5 rounded-2xl liquid-btn-wine font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  {t(lang, "nav.login")}
                </Link>
              )}
            </div>

            <button
              className="lg:hidden p-2.5 rounded-2xl liquid-glass text-gray-600 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
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

          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-rose-200/30 dark:border-rose-800/30">
              <div className="flex flex-col gap-3">
                <Link
                  href={hrefCards}
                  className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(lang, "nav.catalog")}
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href={hrefFavorites}
                      className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(lang, "nav.favorites")}
                    </Link>
                    <Link
                      href={hrefAddCard}
                      className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(lang, "nav.addWine")}
                    </Link>
                    <Link
                      href={hrefProfile}
                      className="px-4 py-3 rounded-2xl liquid-glass font-medium text-gray-700 dark:text-gray-300 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(lang, "nav.profile")}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-2xl liquid-glass text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300"
                    >
                      {t(lang, "nav.logout")}
                    </button>
                  </>
                ) : (
                  <Link
                    href={hrefLogin}
                    className="px-4 py-3 rounded-2xl liquid-btn-wine text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t(lang, "nav.login")}
                  </Link>
                )}

                <div className="flex items-center justify-between gap-3 rounded-2xl liquid-glass px-4 py-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(lang, "nav.language")}
                  </span>
                  {languageSwitcher}
                </div>

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
                  {theme === "dark"
                    ? t(lang, "nav.theme.dark")
                    : t(lang, "nav.theme.light")}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="h-16" />
    </>
  );
}
