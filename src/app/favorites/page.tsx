"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WineCardComponent from "@/components/WineCard";
import { cardsAPI, cacheUtils } from "@/services/api";
import { WineCard } from "@/types";

function FavoritesPageContent() {
  const router = useRouter();

  const [cards, setCards] = useState<WineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Ref для оптимістичних оновлень
  const previousCardsRef = useRef<WineCard[] | null>(null);

  // Fetch favorites з кешуванням
  const fetchFavorites = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await cardsAPI.getFavorites();
        // Mark all cards as favorites
        const favoritesWithFlag = response.results.map((card) => ({
          ...card,
          isFavorite: true,
        }));
        setCards(favoritesWithFlag);
        previousCardsRef.current = null;
      } catch (err: any) {
        console.error("Error fetching favorites:", err);

        // При помилці мережі, пробуємо з кешу
        if (!navigator.onLine) {
          const cached = localStorage.getItem("wine-cache:favorites:all");
          if (cached) {
            try {
              const cachedData = JSON.parse(cached);
              const favoritesWithFlag = (cachedData.results || []).map(
                (card: WineCard) => ({
                  ...card,
                  isFavorite: true,
                }),
              );
              setCards(favoritesWithFlag);
              setError("Офлайн режим - показані кешовані улюблені");
              return;
            } catch (e) {
              console.error("Cache parse error:", e);
            }
          }
        }

        if (err.response?.status === 401) {
          setError("Потрібно увійти в систему");
          localStorage.removeItem("token");
          setTimeout(() => router.push("/login"), 2000);
        } else if (err.response?.status === 403) {
          setError("Доступ заборонено");
        } else {
          setError(
            err.response?.data?.message || "Помилка завантаження улюблених",
          );
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [router],
  );

  // Initial fetch
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (cardId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      throw new Error("No token");
    }

    // Зберігаємо попередній стан
    if (!previousCardsRef.current) {
      previousCardsRef.current = [...cards];
    }

    // Оптимістичне оновлення - видаляємо картку зі списку
    setCards((prev) => prev.filter((card) => card._id !== cardId));

    try {
      await cardsAPI.toggleFavorite(cardId);
      // Очищуємо кеш
      cacheUtils.clearFavorites();
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      // Відкат при помилці
      if (previousCardsRef.current) {
        setCards(previousCardsRef.current);
        previousCardsRef.current = null;
      }
      if (err.response?.status === 401) {
        router.push("/login");
      }
      throw err;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-4xl font-serif font-bold text-rose-900 mb-2">
            Мої улюблені вина
          </h1>
          <p className="text-rose-700">
            Ваша персональна колекція улюблених вин ({cards.length})
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {error && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                error.includes("Офлайн")
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-rose-600 text-lg">Завантаження...</div>
            </div>
          ) : !cards || cards.length === 0 ? (
            <div className="flex items-center justify-center h-64 glass-card rounded-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">💔</div>
                <p className="text-rose-700 text-lg">
                  У вас поки немає улюблених вин
                </p>
                <p className="text-rose-500 text-sm mt-2">
                  Додавайте вина до улюблених, натискаючи на сердечко
                </p>
                <a
                  href="/cards"
                  className="inline-block mt-4 px-6 py-2 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition-colors"
                >
                  Переглянути каталог
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <WineCardComponent
                    key={card._id}
                    card={card}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}
