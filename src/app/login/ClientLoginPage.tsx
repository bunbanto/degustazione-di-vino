"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authAPI, getApiErrorMessage } from "@/services/api";
import { useUserStore } from "@/store/userStore";
import { t } from "@/i18n/i18n";
import { getLangFromPath, withLang } from "@/i18n/routeUtils";
import { getUserRole } from "@/lib/wineCardUtils";

export default function ClientLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await authAPI.register(
          formData.name,
          formData.email,
          formData.password,
        );
        // After registration, switch to login mode
        setIsRegister(false);
        setError(t(lang, "status.registerSuccess"));
      } else {
        const response = await authAPI.login(formData.email, formData.password);

        // Зберігаємо дані з відповіді сервера
        const serverUser = response.user;
        const userData = {
          _id: serverUser._id,
          id: serverUser.id || serverUser._id,
          name: serverUser.name || formData.name || t(lang, "common.user"),
          username:
            serverUser.username ||
            serverUser.name ||
            formData.name ||
            t(lang, "common.user"),
          email: serverUser.email || formData.email,
          role: getUserRole(serverUser),
          createdAt: serverUser.createdAt,
          cardCount: serverUser.cardCount ?? 0,
          favoritesCount: serverUser.favoritesCount ?? 0,
        };

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Sync user to Zustand store
        useUserStore.getState().setCurrentUser(userData);

        router.push(withLang("/cards", lang));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t(lang, "status.genericError")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Animated background orbs for liquid glass effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Title with glass effect */}
        <div className="text-center mb-8">
          <Link
            href={withLang("/", lang)}
            className="text-4xl font-serif font-bold text-rose-800 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors inline-block liquid-glass px-6 py-3 rounded-2xl"
          >
            🍷 Degustazione
          </Link>
          <p className="text-rose-600 dark:text-rose-400 mt-3 liquid-glass inline-block px-4 py-1.5 rounded-full text-sm">
            {isRegister
              ? t(lang, "login.create")
              : t(lang, "login.signInToAccount")}
          </p>
        </div>

        {/* Form Card with heavy liquid glass */}
        <div className="liquid-glass-heavy fluid-rounded-3xl p-8 shadow-2xl">
          {error && (
            <div
              className={`mb-6 p-4 rounded-2xl text-sm backdrop-blur-md ${
                error === t(lang, "status.registerSuccess")
                  ? "bg-green-100/80 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                  : "bg-red-100/80 dark:bg-red-900/50 text-red-700 dark:text-red-400"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t(lang, "login.name")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="liquid-input"
                  placeholder={t(lang, "login.name")}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="liquid-input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t(lang, "login.password")}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="liquid-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 liquid-btn-wine rounded-2xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t(lang, "login.loading")}
                </>
              ) : isRegister ? (
                t(lang, "login.register")
              ) : (
                <>
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {t(lang, "nav.login")}
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode with glass effect */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline text-sm liquid-glass px-4 py-2 rounded-full transition-all hover:scale-105"
            >
              {isRegister
                ? t(lang, "login.haveAccount")
                : t(lang, "login.noAccount")}
            </button>
          </div>
        </div>

        {/* Back to Home with glass effect */}
        <div className="text-center mt-6">
          <Link
            href={withLang("/", lang)}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline text-sm liquid-glass inline-block px-4 py-2 rounded-full transition-all hover:scale-105"
          >
            {t(lang, "login.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
