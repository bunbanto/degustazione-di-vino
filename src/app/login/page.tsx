"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import { useUserStore } from "@/store/userStore";

export default function LoginPage() {
  const router = useRouter();
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
        setError("Реєстрація успішна! Тепер увійдіть.");
      } else {
        const response = await authAPI.login(formData.email, formData.password);

        // Зберігаємо дані з відповіді сервера
        const serverUser = response.user;
        const userData = {
          _id: serverUser._id,
          id: serverUser.id || serverUser._id,
          name: serverUser.name || formData.name || "Користувач",
          username:
            serverUser.username ||
            serverUser.name ||
            formData.name ||
            "Користувач",
          email: serverUser.email || formData.email,
          role: serverUser.role || "user",
          createdAt: serverUser.createdAt,
          cardCount: serverUser.cardCount ?? 0,
          favoritesCount: serverUser.favoritesCount ?? 0,
        };

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Sync user to Zustand store
        useUserStore.getState().setCurrentUser(userData);

        router.push("/cards");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Сталася помилка. Спробуйте ще раз.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl font-serif font-bold text-rose-800 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
          >
            🍷 Degustazione
          </Link>
          <p className="text-rose-600 dark:text-rose-400 mt-2">
            {isRegister ? "Створіть акаунт" : "Увійдіть до акаунту"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                error.includes("успішна")
                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ваше ім&apos;я
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  placeholder="Ваше ім'я"
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
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Завантаження..."
                : isRegister
                  ? "Зареєструватися"
                  : "Увійти"}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline text-sm"
            >
              {isRegister
                ? "Вже маєте акаунт? Увійдіть"
                : "Немає акаунту? Зареєструйтеся"}
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline text-sm"
          >
            ← Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
