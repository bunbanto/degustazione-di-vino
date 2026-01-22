"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import WineCardComponent from "@/components/WineCard";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import { cardsAPI } from "@/services/api";
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

  // Fetch cards from server with server-side filtering
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await cardsAPI.getAll(filters, {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      setCards(response.cards);
      setTotalPages(response.totalPages);
      setTotalCount(response.total);
    } catch (err: any) {
      console.error("Error fetching cards:", err);

      if (err.response?.status === 401) {
        setError("Потрібно увійти в систему");
        localStorage.removeItem("token");
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 403) {
        setError("Доступ заборонено");
      } else {
        setError(err.response?.data?.message || "Помилка завантаження карток");
      }
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, router]);

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

              // Get name from object or username field
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
    fetchCards();
  }, [fetchCards]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);

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

    try {
      const response = await cardsAPI.rate(id, rating);
      console.log("Rating response:", response);
      await fetchCards(); // Refresh to show updated average rating and user rating
    } catch (err: any) {
      console.error("Error rating card:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      }
      throw err; // Re-throw to let WineCard handle the error
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
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
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
