"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WineCardComponent from "@/components/WineCard";
import FilterPanel from "@/components/FilterPanel";
import { cardsAPI, cacheUtils } from "@/services/api";
import { WineCard, FilterParams } from "@/types";
import { withAuth } from "@/components/withAuth";

function ClientFavoritesPage() {
  const router = useRouter();

  const [cards, setCards] = useState<WineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<FilterParams>({});

  // Ref для оптимістичних оновлень
  const previousCardsRef = useRef<WineCard[] | null>(null);
  // Ref для відстеження зміни користувача
  const previousUserIdRef = useRef<string | null>(null);

  // Fetch favorites з очищенням кешу при зміні користувача
  const fetchFavorites = useCallback(
    async (showLoading = true, forceRefresh = false) => {
      if (showLoading) {
        setLoading(true);
      }
      setError("");

      try {
        // Якщо forceRefresh - очищуємо кеш улюблених перед запитом
        if (forceRefresh) {
          cacheUtils.clearFavorites();
        }

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

  // Initial fetch + перевірка зміни користувача
  useEffect(() => {
    // Отримуємо поточного userId
    const getCurrentUserId = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id?.toString() || user._id?.toString() || null;
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    const currentUserId = getCurrentUserId();

    // Якщо userId змінився (інший акаунт), очищуємо кеш і робимо fresh fetch
    if (previousUserIdRef.current !== currentUserId) {
      cacheUtils.clearFavorites();
      fetchFavorites(true, true);
      previousUserIdRef.current = currentUserId;
    } else {
      fetchFavorites();
    }
  }, [fetchFavorites]);

  const handleToggleFavorite = async (cardId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      throw new Error("No token");
    }

    // Зберігаємо попередній стан для відкату
    if (!previousCardsRef.current) {
      previousCardsRef.current = [...cards];
    }

    // Зберігаємо поточний стан isFavorite для картки
    const currentCard = cards.find((c) => c._id === cardId);
    const wasFavorite = currentCard?.isFavorite || false;

    try {
      await cardsAPI.toggleFavorite(
        cardId,
        cards,
        (newCards, confirmedIsFavorite) => {
          // На сторінці улюблених, якщо картку видалено з улюблених,
          // вона більше не повинна відображатися
          if (newCards) {
            setCards(newCards);
          } else if (confirmedIsFavorite !== undefined) {
            // Якщо підтверджено isFavorite = false, видаляємо картку зі списку
            if (!confirmedIsFavorite) {
              setCards((prevCards) =>
                prevCards.filter((card) => card._id !== cardId),
              );
            } else {
              // Якщо isFavorite = true (додано назад), оновлюємо картку
              setCards((prevCards) =>
                prevCards.map((card) =>
                  card._id === cardId
                    ? { ...card, isFavorite: confirmedIsFavorite }
                    : card,
                ),
              );
            }
          }
        },
      );
      // Очищуємо кеш улюблених
      cacheUtils.clearFavorites();
      // Очищуємо кеш карток для примусового оновлення
      cacheUtils.clearCards();
      // Після успішного оновлення, робимо примусове оновлення з сервера
      setTimeout(() => {
        fetchFavorites(false);
      }, 100);
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

  // Обробник оцінювання - оновлює рейтинг у списку улюблених
  const handleRate = async (id: string, rating: number): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      throw new Error("No token");
    }

    // Зберігаємо попередній стан для відкату
    if (!previousCardsRef.current) {
      previousCardsRef.current = [...cards];
    }

    // Отримуємо поточного користувача для ідентифікації
    let currentUserId = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUserId = user.id?.toString() || user._id?.toString();
      }
    } catch (e) {
      console.error("Error getting user:", e);
    }

    // Оптимістичне оновлення з правильним розрахунком середнього рейтингу
    const updatedCards = cards.map((card) => {
      if (card._id !== id) {
        return card;
      }

      // Створюємо копію ratings
      const newRatings = card.ratings ? [...card.ratings] : [];

      // Знаходимо індекс існуючої оцінки користувача
      const existingRatingIndex = currentUserId
        ? newRatings.findIndex((r) => {
            const rUserId =
              typeof r.userId === "object" ? r.userId._id : r.userId;
            return rUserId === currentUserId;
          })
        : -1;

      // Оновлюємо або додаємо оцінку
      if (existingRatingIndex !== -1) {
        newRatings[existingRatingIndex] = {
          ...newRatings[existingRatingIndex],
          value: rating,
        };
      } else if (currentUserId) {
        newRatings.push({
          userId: { _id: currentUserId },
          value: rating,
          username: "",
        });
      }

      // Перераховуємо середній рейтинг
      const totalRating = newRatings.reduce((acc, curr) => acc + curr.value, 0);
      const newAverageRating = parseFloat(
        (totalRating / newRatings.length).toFixed(1),
      );

      return {
        ...card,
        rating: newAverageRating,
        ratings: newRatings,
      };
    });

    setCards(updatedCards);

    try {
      await cardsAPI.rate(id, rating, cards, (newCards) => {
        setCards(newCards);
      });
      // Після успіху, оновлюємо з сервера
      await fetchFavorites(false);
    } catch (err: any) {
      console.error("Error rating card:", err);
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

  // Handle delete card
  const handleDelete = async (cardId: string): Promise<void> => {
    try {
      // Спочатку видаляємо картку з локального стану для миттєвого відгуку
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));

      // Видаляємо з API
      await cardsAPI.delete(cardId);

      // Очищуємо кеш
      cacheUtils.clearCards();
      cacheUtils.clearFavorites();

      // Оновлюємо дані з сервера
      fetchFavorites(false);
    } catch (err: any) {
      console.error("Error deleting card:", err);
      // Відновлюємо картки при помилці
      fetchFavorites(false);
      if (err.response?.status === 401) {
        router.push("/login");
      }
      throw err;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Header & Filter Panel Combined */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="liquid-glass rounded-2xl p-6 mb-4 text-center">
                <h1 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-2">
                  Мої улюблені
                </h1>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  {cards.length}шт у колекції
                </p>
              </div>
              <FilterPanel filters={filters} onFilterChange={setFilters} />
            </aside>

            {/* Content */}
            <div className="flex-1">
              {error && (
                <div
                  className={`p-4 rounded-lg mb-6 ${
                    error.includes("Офлайн")
                      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                      : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                  }`}
                >
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-rose-600 dark:text-rose-400 text-lg">
                    Завантаження...
                  </div>
                </div>
              ) : !cards || cards.length === 0 ? (
                <div className="flex items-center justify-center h-64 glass-card rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💔</div>
                    <p className="text-rose-700 dark:text-rose-400 text-lg">
                      У вас поки немає улюблених вин
                    </p>
                    <p className="text-rose-500 dark:text-rose-500 text-sm mt-2">
                      Додавайте вина до улюблених, натискаючи на сердечко
                    </p>
                    <a
                      href="/cards"
                      className="inline-block mt-4 px-6 py-2 bg-rose-600 dark:bg-rose-700 text-white rounded-full font-medium hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors"
                    >
                      Переглянути каталог
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cards
                    .filter((card) => {
                      // Filter by search
                      if (filters.search) {
                        const searchLower = filters.search.toLowerCase();
                        const nameMatch = card.name
                          ?.toLowerCase()
                          .includes(searchLower);
                        const wineryMatch = card.winery
                          ?.toLowerCase()
                          .includes(searchLower);
                        if (!nameMatch && !wineryMatch) return false;
                      }

                      // Filter by type
                      if (filters.type && card.type !== filters.type) {
                        return false;
                      }

                      // Filter by color
                      if (filters.color && card.color !== filters.color) {
                        return false;
                      }

                      // Filter by frizzante
                      if (filters.frizzante && !card.frizzante) {
                        return false;
                      }

                      // Filter by min rating
                      if (
                        filters.minRating &&
                        (card.rating || 0) < filters.minRating
                      ) {
                        return false;
                      }

                      return true;
                    })
                    .map((card) => (
                      <WineCardComponent
                        key={card._id}
                        card={card}
                        onRate={handleRate}
                        onToggleFavorite={handleToggleFavorite}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(ClientFavoritesPage);
