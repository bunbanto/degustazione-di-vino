"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { cardsAPI, cacheUtils, getApiErrorMessage } from "@/services/api";
import { WineCard } from "@/types";
import CommentsSection from "@/components/CommentsSection";
import EditCardModal from "@/components/EditCardModal";
import { useUserStore } from "@/store/userStore";
import { getWineTypeLabel, getWineColorLabel } from "@/constants/wine";

export default function ClientCardViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [card, setCard] = useState<WineCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get current user from userStore
  const currentUser = useUserStore((state) => state.currentUser);
  const currentUserId = currentUser?.id?.toString() || currentUser?._id || null;

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const previousFavoriteRef = useRef<boolean>(false);

  // Fetch card data - only on mount and id change
  useEffect(() => {
    let isMounted = true;

    const fetchCard = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const cardPromise = cardsAPI.getById(id);
        const favoritePromise = token
          ? cardsAPI.checkFavorite(id).catch((favoriteError: any) => {
              if (favoriteError?.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
              }
              return null;
            })
          : Promise.resolve(null);

        const [cardData, favoriteCheck] = await Promise.all([
          cardPromise,
          favoritePromise,
        ]);

        const isCardFavorite = favoriteCheck?.isFavorite ?? !!cardData.isFavorite;

        if (isMounted) {
          setCard(cardData);
          setIsFavorite(isCardFavorite);
          previousFavoriteRef.current = isCardFavorite;
        }
      } catch (err: any) {
        if (isMounted) {
          if (err?.response?.status === 404) {
            setError("Картку не знайдено або її було видалено.");
          } else {
            setError(getApiErrorMessage(err, "Помилка завантаження картки"));
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCard();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check if current user is the card author
  const isCardAuthor = (() => {
    if (!currentUserId || !card) return false;

    if (card.owner) {
      const ownerId =
        typeof card.owner === "object" ? card.owner._id : card.owner;
      if (currentUserId && ownerId && currentUserId === ownerId.toString()) {
        return true;
      }
    }

    if (card.authorId) {
      return currentUserId === card.authorId.toString();
    }

    return false;
  })();

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!previousFavoriteRef.current) {
      previousFavoriteRef.current = isFavorite;
    }

    setIsFavoriteLoading(true);
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      await cardsAPI.toggleFavorite(id);
      // Clear cache
      cacheUtils.clearFavorites();

      // Verify the actual state from server
      try {
        const favoriteCheck = await cardsAPI.checkFavorite(id);
        setIsFavorite(favoriteCheck.isFavorite);
        previousFavoriteRef.current = favoriteCheck.isFavorite;
      } catch (checkErr) {
        console.log("Could not verify favorite status:", checkErr);
      }
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      // Revert on error
      setIsFavorite(previousFavoriteRef.current);
      previousFavoriteRef.current = false;
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 dark:text-green-500";
    if (rating >= 6) return "text-yellow-600 dark:text-yellow-500";
    if (rating >= 4) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };

  const getColorBadgeStyle = (color: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; border?: string }
    > = {
      rosso: { bg: "bg-red-600", text: "text-white" },
      bianco: {
        bg: "bg-yellow-50 dark:bg-yellow-900/30",
        text: "text-gray-800 dark:text-gray-200",
        border: "border border-gray-200 dark:border-gray-700",
      },
      rosato: {
        bg: "bg-pink-100 dark:bg-pink-900/30",
        text: "text-gray-800 dark:text-gray-200",
      },
    };
    return (
      styles[color] || {
        bg: "bg-gray-200 dark:bg-gray-700",
        text: "text-gray-800 dark:text-gray-200",
      }
    );
  };

  const handleCardSaved = () => {
    const fetchCard = async () => {
      try {
        const cardData = await cardsAPI.getById(id);
        setCard(cardData);
      } catch (err: any) {
        console.error("Error refreshing card:", err);
      }
    };
    fetchCard();
  };

  const handleCardDeleted = async () => {
    await cardsAPI.delete(id);
    cacheUtils.clearCards();
    cacheUtils.clearFavorites();
    router.push("/cards");
  };

  function getUserIdString(
    userId:
      | string
      | { _id?: string; id?: string | number; name?: string }
      | null
      | undefined,
  ): string {
    if (!userId) return "";
    if (typeof userId === "string") return userId;
    return (
      userId._id?.toString() ||
      (userId.id !== undefined ? userId.id.toString() : "")
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-64 pt-24">
          <div className="text-rose-600 dark:text-rose-400 text-lg">
            Завантаження...
          </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-64 pt-24">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-lg mb-4">
              {error || "Картка не знайдена"}
            </div>
            <Link
              href="/cards"
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline"
            >
              ← Повернутися до каталогу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayRating = card.rating || 0;
  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline text-sm"
            >
              ← Повернутися назад
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Top Left - Image */}
            <div className="lg:order-1 lg:col-span-5">
              <div className="glass-card rounded-2xl overflow-hidden shadow-lg relative">
                <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-dark-800">
                  <img
                    src={
                      card.img ||
                      card.image ||
                      "https://res.cloudinary.com/demo/image/upload/wines/default.jpg"
                    }
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className={`absolute top-4 right-4 bg-white/90 dark:bg-dark-700/90 backdrop-blur p-3 rounded-full transition-all duration-300 shadow-lg hover:bg-rose-50 dark:hover:bg-dark-600 ${
                    isFavoriteLoading ? "opacity-50 cursor-wait" : ""
                  }`}
                  title={
                    isFavorite ? "Видалити з улюблених" : "Додати до улюблених"
                  }
                >
                  <svg
                    className={`w-6 h-6 transition-transform duration-300 ${
                      isFavorite
                        ? "text-rose-500 scale-110"
                        : "text-gray-400 dark:text-gray-500 hover:text-rose-400"
                    }`}
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      animation: isFavorite
                        ? "heartBeat 0.6s ease-in-out"
                        : "none",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Top Right - Info */}
            <div className="lg:order-2 lg:col-span-7 space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-2">
                  {card.name}
                </h1>
                {card.winery && (
                  <p className="text-xl text-rose-600 dark:text-rose-400 font-medium">
                    {card.winery}
                  </p>
                )}
              </div>

              {/* Wine Details */}
              <div className="glass-card rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-4">
                  Деталі
                </h2>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 rounded-full text-sm font-medium">
                    {getWineTypeLabel(card.type)}
                  </span>
                  <span
                    className={`px-3 py-1 ${getColorBadgeStyle(card.color).bg} ${getColorBadgeStyle(card.color).text} rounded-full text-sm font-medium capitalize ${getColorBadgeStyle(card.color).border || ""}`}
                  >
                    {getWineColorLabel(card.color)}
                  </span>
                  {card.frizzante && (
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium">
                      Frizzante
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {(card.year || card.anno) && (
                    <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Рік
                      </div>
                      <div className="font-semibold dark:text-gray-200">
                        {card.year || card.anno}
                      </div>
                    </div>
                  )}
                  {card.alcohol && (
                    <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Алкоголь
                      </div>
                      <div className="font-semibold dark:text-gray-200">
                        {card.alcohol}%
                      </div>
                    </div>
                  )}
                  {card.price && (
                    <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Ціна
                      </div>
                      <div className="font-semibold dark:text-gray-200">
                        {typeof card.price === "number"
                          ? `€${card.price.toFixed(2)}`
                          : card.price}
                      </div>
                    </div>
                  )}
                </div>

                {(card.country || card.region) && (
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {card.country && (
                      <span className="flex items-center gap-1">
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
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {card.country}
                      </span>
                    )}
                    {card.region && (
                      <span className="flex items-center gap-1">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {card.region}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Left - Rating Summary & User Ratings */}
            <div className="lg:order-3 lg:col-span-5">
              <div className="bg-amber-50 dark:bg-dark-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-4xl font-bold ${getRatingColor(displayRating)}`}
                    >
                      {displayRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div>із 10</div>
                      <div>({card.ratings?.length || 0} оцінок)</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {stars.map((star) => {
                      const isFull = displayRating >= star;
                      const isHalf = !isFull && displayRating >= star - 0.5;
                      return (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            isFull || isHalf
                              ? "text-yellow-400"
                              : "text-gray-200 dark:text-gray-600"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Ratings */}
                {card.ratings && card.ratings.length > 0 && (
                  <div className="border-t border-amber-200 dark:border-dark-700 pt-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Оцінки користувачів
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {card.ratings.map((rating, idx) => {
                        const userIdStr = getUserIdString(rating.userId || "");
                        const displayUsername =
                          (typeof rating.userId === "object" &&
                            rating.userId.name) ||
                          rating.username ||
                          "";

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-amber-100 dark:border-dark-700 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
                                <span className="text-rose-600 dark:text-rose-400 font-medium text-xs">
                                  {displayUsername.charAt(0).toUpperCase() ||
                                    "?"}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                                {displayUsername || "Користувач"}
                              </span>
                              {userIdStr === currentUserId && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  Ви
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    rating.value >= star
                                      ? "text-yellow-400"
                                      : "text-gray-200 dark:text-gray-600"
                                  }`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                                {rating.value.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Right - Description + Actions */}
            <div className="lg:order-4 lg:col-span-7 space-y-6">
              {/* Description */}
              {card.description && (
                <div className="glass-card rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-3">
                    Опис
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {card.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isFavorite
                      ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-800/50"
                      : "bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600"
                  } ${isFavoriteLoading ? "opacity-50 cursor-wait" : ""}`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      isFavorite
                        ? "text-rose-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      animation: isFavorite
                        ? "heartBeat 0.6s ease-in-out"
                        : "none",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {isFavorite ? "В улюблених" : "До улюблених"}
                </button>

                {/* Edit Button for Author */}
                {isCardAuthor && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 py-4 bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Редагувати картку
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentsSection
              cardId={card._id}
              currentUserId={currentUserId || undefined}
            />
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {card && (
        <EditCardModal
          card={card}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={handleCardSaved}
          onDeleted={handleCardDeleted}
        />
      )}
    </div>
  );
}
