"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { authAPI } from "@/services/api";
import { cacheUtils } from "@/services/api";
import { useUserStore } from "@/store/userStore";

interface UserData {
  id?: string | number;
  _id?: string;
  name?: string;
  username?: string;
  email: string;
  role: string;
  createdAt?: string;
  cardCount?: number;
  favoritesCount?: number;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          // Sync to store if stats are available
          if (
            parsedUser.cardCount !== undefined ||
            parsedUser.favoritesCount !== undefined
          ) {
            setCurrentUser(parsedUser);
          }
        } catch (e) {
          console.error("Error parsing user:", e);
        }
      }

      try {
        const profile = await authAPI.getProfile();
        const profileData = profile.user || profile;

        const userWithId = {
          id: profileData.id || profileData._id,
          _id: profileData._id,
          name: profileData.name || profileData.username || "",
          username: profileData.username || profileData.name || "",
          email: profileData.email || "",
          role: profileData.role || "user",
          createdAt: profileData.createdAt,
          cardCount: profileData.cardCount ?? 0,
          favoritesCount: profileData.favoritesCount ?? 0,
        };

        setUser(userWithId);
        setCurrentUser(userWithId);
        localStorage.setItem("user", JSON.stringify(userWithId));
      } catch (err: any) {
        console.error("Error loading profile:", err);
        if (err.response?.status === 401) {
          router.push("/login");
          return;
        }
        setError("Не вдалося завантажити профіль");
      }

      setIsLoading(false);
    };

    loadUser();
  }, [router, setCurrentUser]);

  const handleLogout = () => {
    cacheUtils.clearAll();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-rose-50 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-rose-600 dark:text-rose-400">Завантаження...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.username || "Користувач";
  const firstLetter = displayName[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-8 text-center">
            Особистий кабінет
          </h1>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="glass-card rounded-2xl p-8 shadow-xl mb-8">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-3xl font-serif">
                {firstLetter}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-200 mb-1">
                {displayName}
              </h2>
              <p className="text-rose-600 dark:text-rose-400">{user?.email}</p>
              {user?.role && (
                <span className="inline-block mt-2 px-3 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div className="text-center p-3 sm:p-4 bg-rose-50 dark:bg-dark-700 rounded-xl">
                <div className="text-lg sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {user?.favoritesCount ?? "-"}
                </div>
                <div className="text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                  Улюблені
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-rose-50 dark:bg-dark-700 rounded-xl">
                <div className="text-lg sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {user?.cardCount ?? "-"}
                </div>
                <div className="text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                  Мої вина
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-rose-50 dark:bg-dark-700 rounded-xl">
                <div className="text-lg sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })
                    : "-"}
                </div>
                <div className="text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                  Дата реєстрації
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              >
                Вийти
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-rose-900 dark:text-rose-300 mb-4">
              Швидкі посилання
            </h3>
            <div className="space-y-3">
              <Link
                href="/favorites"
                className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-dark-700 rounded-xl hover:bg-rose-100 dark:hover:bg-dark-600 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-200 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-rose-900 dark:text-rose-200">
                    Мої улюблені
                  </div>
                  <div className="text-sm text-rose-600 dark:text-rose-400">
                    Переглянути збережені вина
                  </div>
                </div>
              </Link>

              <Link
                href="/add-card"
                className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-dark-700 rounded-xl hover:bg-rose-100 dark:hover:bg-dark-600 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-200 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-rose-900 dark:text-rose-200">
                    Додати вино
                  </div>
                  <div className="text-sm text-rose-600 dark:text-rose-400">
                    Поділіться своїм улюбленим вином
                  </div>
                </div>
              </Link>

              <Link
                href="/cards"
                className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-dark-700 rounded-xl hover:bg-rose-100 dark:hover:bg-dark-600 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-200 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-rose-900 dark:text-rose-200">
                    Каталог вин
                  </div>
                  <div className="text-sm text-rose-600 dark:text-rose-400">
                    Переглянути всі вина
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
