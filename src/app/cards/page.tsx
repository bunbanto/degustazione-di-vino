"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import WineCardComponent from "@/components/WineCard";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import { cardsAPI } from "@/services/api";
import { WineCard, FilterParams } from "@/types";

const ITEMS_PER_PAGE = 6;

export default function CardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allCards, setAllCards] = useState<WineCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<WineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<FilterParams>({
    type: searchParams.get("type") || undefined,
    color: searchParams.get("color") || undefined,
    minRating: searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : undefined,
    search: searchParams.get("search") || undefined,
  });

  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
  );

  // Fetch all cards from server
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await cardsAPI.getAll({}, { page: 1, limit: 1000 });
      setAllCards(response.cards);
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка завантаження карток");
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to all cards
  const applyFilters = useCallback(
    (currentFilters: FilterParams) => {
      let result = [...allCards];

      if (currentFilters.type) {
        result = result.filter((card) => card.type === currentFilters.type);
      }

      if (currentFilters.color) {
        result = result.filter((card) => card.color === currentFilters.color);
      }

      if (currentFilters.minRating) {
        result = result.filter(
          (card) => card.rating >= currentFilters.minRating!,
        );
      }

      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        result = result.filter((card) => {
          const nameMatch = card.name?.toLowerCase().includes(searchLower);
          const wineryMatch = card.winery?.toLowerCase().includes(searchLower);
          const countryMatch = card.country
            ?.toLowerCase()
            .includes(searchLower);
          const regionMatch = card.region?.toLowerCase().includes(searchLower);
          return nameMatch || wineryMatch || countryMatch || regionMatch;
        });
      }

      setFilteredCards(result);
    },
    [allCards],
  );

  // Initial fetch
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Apply filters when they change or allCards is loaded
  useEffect(() => {
    if (allCards.length > 0) {
      applyFilters(filters);
    }
  }, [allCards, filters, applyFilters]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1);

    // Update URL
    const params = new URLSearchParams();
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.color) params.set("color", newFilters.color);
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

  const handleRate = async (id: string, rating: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await cardsAPI.rate(id, rating);
      fetchCards(); // Refresh to show updated rating
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      }
    }
  };

  // Paginate filtered cards
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCards = filteredCards.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

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
            Знайдіть своє ідеальне вино серед {filteredCards.length} пропозицій
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
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-rose-600 text-lg">Завантаження...</div>
                </div>
              ) : !paginatedCards || paginatedCards.length === 0 ? (
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
                    {paginatedCards.map((card) => (
                      <WineCardComponent
                        key={card._id}
                        card={card}
                        onRate={handleRate}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
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
