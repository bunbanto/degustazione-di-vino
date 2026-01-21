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
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Fetch user profile to get the actual ID
        try {
          const profile = await authAPI.getProfile();
          const userWithId = {
            ...response.user,
            id: profile.id || profile._id,
            username: profile.username || profile.name || response.user.name,
          };
          localStorage.setItem("user", JSON.stringify(userWithId));

          // Sync user to Zustand store
          useUserStore.getState().setCurrentUser(userWithId);
        } catch (profileError) {
          // If profile fetch fails, still sync what we have
          useUserStore.getState().setCurrentUser(response.user);
        }

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
            className="text-4xl font-serif font-bold text-rose-800 hover:text-rose-700 transition-colors"
          >
            🍷 Degustazione
          </Link>
          <p className="text-rose-600 mt-2">
            {isRegister ? "Створіть акаунт" : "Увійдіть до акаунту"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                error.includes("успішна")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше ім&apos;я
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  placeholder="Ваше ім'я"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="text-rose-600 hover:text-rose-800 underline text-sm"
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
            className="text-rose-600 hover:text-rose-800 underline text-sm"
          >
            ← Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
