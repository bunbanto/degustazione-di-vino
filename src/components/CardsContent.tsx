"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WineCardComponent from "@/components/WineCard";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import { cardsAPI, cacheUtils } from "@/services/api";
import { WineCard, FilterParams } from "@/types";
import { useUserStore } from "@/store/userStore";

const ITEMS_PER_PAGE = 6;

interface CardsContentProps {
  initialFilters: FilterParams;
  initialPage: number;
}

function CardsContent({ initialFilters, initialPage }: CardsContentProps) {
  const router = useRouter();

  const [cards, setCards] = useState<WineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [totalPageCount, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Refs для оптимістичних оновлень
  const previousCardsRef = useRef<WineCard[] | null>(null);
  const isUpdatingRef = useRef(false);
  // Ref для відстеження зміни користувача
  const previousUserIdRef = useRef<string | null>(null);

  // Fetch cards з кешуванням та fallback
  const fetchCards = useCallback(
    async (showLoading = true) => {
      if (isUpdatingRef.current && !showLoading) return;

      if (showLoading) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await cardsAPI.getAll(filters, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        setCards(response.cards);
        setTotalPages(response.totalPages);
        setTotalCount(response.total);
        previousCardsRef.current = null;
      } catch (err: any) {
        console.error("Error fetching cards:", err);

        // При помилці мережі, пробуємо отримати з кешу
        if (!navigator.onLine) {
          const cacheKey = `wine-cache:cards:${JSON.stringify({
            filters,
            pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
          })}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const cachedData = JSON.parse(cached);
              setCards(cachedData.cards || []);
              setTotalPages(cachedData.totalPages || 1);
              setTotalCount(cachedData.total || 0);
              setError("Офлайн режим - показані кешовані дані");
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
            err.response?.data?.message || "Помилка завантаження карток",
          );
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [filters, currentPage, router],
  );

  // Sync user names from cards to Zustand store
  const setUserName = useUserStore((state) => state.setUserName);

  useEffect(() => {
    if (cards.length > 0) {
      cards.forEach((card: WineCard) => {
        if (card.ratings && Array.isArray(card.ratings)) {
          card.ratings.forEach((r) => {
            if (r.userId) {
              const userIdStr =
                typeof r.userId === "string" ? r.userId : r.userId._id;

              const username =
                typeof r.userId === "object" && r.userId.name
                  ? r.userId.name
                  : r.username;

              if (userIdStr && username) {
                setUserName(userIdStr, username);
              }
            }
          });
        }
      });
    }
  }, [cards, setUserName]);

  // Initial fetch and when filters/page change
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

    // Якщо userId змінився (інший акаунт), очищуємо весь кеш і робимо fresh fetch
    if (previousUserIdRef.current !== currentUserId) {
      cacheUtils.clearAll();
      fetchCards(true);
      previousUserIdRef.current = currentUserId;
    } else {
      fetchCards();
    }
  }, [fetchCards]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);

    // Очищуємо кеш фільтрів
    cacheUtils.clearCards();

    // Update URL
    const params = new URLSearchParams();
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.color) params.set("color", newFilters.color);
    if (newFilters.frizzante) params.set("frizzante", "true");
    if (newFilters.minRating)
      params.set("minRating", newFilters.minRating.toString());
    if (newFilters.search) params.set("search", newFilters.search);
    params.set("page", "1");

    router.push(`/cards?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    params.set("page", page.toString());

    router.push(`/cards?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      await fetchCards(false);
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
          // Якщо newCards передано, використовуємо його
          if (newCards) {
            setCards(newCards);
          } else if (confirmedIsFavorite !== undefined) {
            // Оновлюємо тільки конкретну картку
            setCards((prevCards) =>
              prevCards.map((card) =>
                card._id === cardId
                  ? { ...card, isFavorite: confirmedIsFavorite }
                  : card,
              ),
            );
          }
        },
      );
      // Очищуємо кеш улюблених
      cacheUtils.clearFavorites();
      // Очищуємо кеш карток для примусового оновлення
      cacheUtils.clearCards();
      // Скидаємо прапорець оновлення для дозволу повторного запиту
      isUpdatingRef.current = false;
      // Після успішного оновлення, робимо примусове оновлення карток з сервера
      // Використовуємо isUpdatingRef для уникнення race conditions
      setTimeout(() => {
        fetchCards(false);
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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-4xl font-serif font-bold text-rose-900 mb-2">
            Каталог вин
          </h1>
          <p className="text-rose-700">
            Знайдіть своє ідеальне вино серед {totalCount} пропозицій
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Panel - Left Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Cards Grid */}
            <div className="flex-1">
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
                    <div className="text-6xl mb-4">🍷</div>
                    <p className="text-rose-700 text-lg">Вина не знайдено</p>
                    <p className="text-rose-500 text-sm mt-2">
                      Спробуйте змінити фільтри
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <WineCardComponent
                        key={card._id}
                        card={card}
                        onRate={handleRate}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>

                  {totalPageCount > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPageCount}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CardsContent;
