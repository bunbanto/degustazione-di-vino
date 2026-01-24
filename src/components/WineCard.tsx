"use client";

import { WineCard as WineCardType } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import EditCardModal from "@/components/EditCardModal";

interface WineCardProps {
  card: WineCardType;
  onRate?: (id: string, rating: number) => void;
  onToggleFavorite?: (id: string) => Promise<void>;
}

// SVG Star component with optional fill percentage
function StarIcon({
  filled,
  half = false,
}: {
  filled: boolean;
  half?: boolean;
}) {
  return (
    <div className="relative w-5 h-5">
      {/* Background (empty star) */}
      <svg
        className="absolute top-0 left-0 w-full h-full text-gray-300"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>

      {/* Foreground (filled/half star) */}
      <svg
        className={`absolute top-0 left-0 w-full h-full ${filled || half ? "text-yellow-400" : "text-transparent"}`}
        viewBox="0 0 20 20"
        style={
          half
            ? {
                clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
              }
            : {}
        }
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  );
}

// Helper to get userId string from various formats
function getUserIdString(
  userId: string | { _id: string; name?: string },
): string {
  return typeof userId === "string" ? userId : userId._id;
}

export default function WineCardComponent({
  card,
  onRate,
  onToggleFavorite,
}: WineCardProps) {
  const router = useRouter();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  // Favorite state - initialize from card prop
  const [isFavorite, setIsFavorite] = useState(!!card.isFavorite);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Refs для відстеження стану
  const previousRatingRef = useRef<number | null>(null);
  const previousFavoriteRef = useRef<boolean>(false);
  const isRatingRef = useRef(false);

  // Sync favorite state when card prop changes
  useEffect(() => {
    setIsFavorite(!!card.isFavorite);
    previousFavoriteRef.current = !!card.isFavorite;
  }, [card.isFavorite]);

  // Get current user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId =
          user.id?.toString() ||
          user._id?.toString() ||
          btoa(user.email || "").slice(0, 24);
        setCurrentUserId(userId);

        if (userId) {
          useUserStore
            .getState()
            .setUserName(
              userId,
              user.username || user.name || `Користувач ${userId.slice(-4)}`,
            );
        }
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  // Get current user's email for owner comparison
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserEmail(user.email || null);
      } catch (e) {
        console.error("Error parsing user email:", e);
      }
    }
  }, []);

  // Check if current user is the card author
  const isCardAuthor = (() => {
    if (!currentUserId && !currentUserEmail) {
      return false;
    }

    if (card.owner) {
      const ownerId =
        typeof card.owner === "object" ? card.owner._id : card.owner;
      const ownerEmail =
        typeof card.owner === "object" ? card.owner.email : null;

      if (currentUserId && ownerId && currentUserId === ownerId.toString()) {
        return true;
      }

      if (currentUserEmail && ownerEmail && currentUserEmail === ownerEmail) {
        return true;
      }

      return false;
    }

    if (card.authorId) {
      return currentUserId === card.authorId.toString();
    }

    return false;
  })();

  // Load all usernames from localStorage into Zustand store
  useEffect(() => {
    try {
      const userNamesFromStorage = JSON.parse(
        localStorage.getItem("userNames") || "{}",
      );
      const setUserName = useUserStore.getState().setUserName;
      Object.entries(userNamesFromStorage).forEach(([userId, username]) => {
        setUserName(userId, username as string);
      });
    } catch (e) {
      console.error("Error loading userNames from localStorage:", e);
    }
  }, []);

  // Store all usernames from card ratings in Zustand store
  useEffect(() => {
    if (card.ratings && Array.isArray(card.ratings)) {
      const setUserName = useUserStore.getState().setUserName;

      card.ratings.forEach((rating) => {
        if (rating.userId) {
          const userIdStr = getUserIdString(rating.userId);

          if (typeof rating.userId === "object" && rating.userId.name) {
            setUserName(userIdStr, rating.userId.name);
          } else if (rating.username) {
            setUserName(userIdStr, rating.username);
          }
        }
      });
    }
  }, [card.ratings]);

  // Load user's rating from the card's ratings array
  useEffect(() => {
    if (isRatingRef.current) {
      return;
    }

    if (card.ratings && Array.isArray(card.ratings) && currentUserId) {
      const userRatingObj = card.ratings.find((r) => {
        const ratingUserIdStr = getUserIdString(r.userId);
        return ratingUserIdStr === currentUserId;
      });

      if (userRatingObj) {
        setUserRating(userRatingObj.value);
      } else {
        setUserRating(null);
      }
    } else if (
      !card.ratings ||
      (Array.isArray(card.ratings) && card.ratings.length === 0)
    ) {
      setUserRating(null);
    }
  }, [card.ratings, currentUserId]);

  // Handle toggle favorite з оптимістичним оновленням
  const handleToggleFavorite = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Зберігаємо попередній стан для відкату
    if (!previousFavoriteRef.current) {
      previousFavoriteRef.current = isFavorite;
    }

    setIsFavoriteLoading(true);

    // Оптимістичне оновлення - одразу змінюємо стан
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      if (onToggleFavorite) {
        await onToggleFavorite(card._id);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Відкат при помилці
      setIsFavorite(previousFavoriteRef.current);
      previousFavoriteRef.current = false;
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [card._id, isFavorite, onToggleFavorite, router]);

  const handleRate = useCallback(
    async (rating: number) => {
      if (isRatingRef.current || isRatingLoading) {
        return;
      }

      if (previousRatingRef.current === null) {
        previousRatingRef.current = userRating;
      }

      isRatingRef.current = true;
      setUserRating(rating);
      setIsRatingLoading(true);

      if (onRate) {
        try {
          await onRate(card._id, rating);
          setTimeout(() => {
            isRatingRef.current = false;
          }, 100);
        } catch (error) {
          console.error("Rating failed:", error);
          isRatingRef.current = false;
          setUserRating(previousRatingRef.current);
          previousRatingRef.current = null;
        } finally {
          setIsRatingLoading(false);
        }
      } else {
        isRatingRef.current = false;
        setIsRatingLoading(false);
      }
    },
    [card._id, onRate, userRating, isRatingLoading],
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    if (rating >= 4) return "text-orange-500";
    return "text-red-500";
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      secco: "Secco",
      abboccato: "Abboccato",
      amabile: "Amabile",
      dolce: "Dolce",
    };
    return types[type] || type;
  };

  const getColorLabel = (color: string) => {
    const colors: Record<string, string> = {
      bianco: "Bianco",
      rosso: "Rosso",
      rosato: "Rosato",
      sparkling: "Ігристе",
    };
    return colors[color] || color;
  };

  const getColorBadgeStyle = (color: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; border?: string }
    > = {
      rosso: { bg: "bg-red-600", text: "text-white" },
      bianco: {
        bg: "bg-yellow-50",
        text: "text-gray-800",
        border: "border border-gray-200",
      },
      rosato: { bg: "bg-pink-100", text: "text-gray-800" },
      sparkling: { bg: "bg-sky-200", text: "text-gray-800" },
    };
    return styles[color] || { bg: "bg-gray-200", text: "text-gray-800" };
  };

  const displayRating = card.rating || 0;
  const currentRating = isRatingLoading
    ? userRating || 0
    : hoverRating || userRating || 0;

  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
        {/* Image with click to navigate */}
        <div
          className="relative h-48 overflow-hidden rounded-t-2xl bg-gray-100 flex items-center justify-center cursor-pointer"
          onClick={() => router.push(`/cards/${card._id}`)}
        >
          <img
            src={
              card.img ||
              card.image ||
              "https://res.cloudinary.com/demo/image/upload/wines/default.jpg"
            }
            alt={card.name}
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
          {card.color && (
            <div
              className={`absolute top-3 left-3 ${getColorBadgeStyle(card.color).bg} ${getColorBadgeStyle(card.color).text} backdrop-blur px-3 py-1 rounded-full text-sm font-medium shadow-md capitalize ${getColorBadgeStyle(card.color).border || ""}`}
            >
              {getColorLabel(card.color)}
            </div>
          )}
          {card.frizzante && (
            <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white shadow-md capitalize mt-8">
              Frizzante
            </div>
          )}

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleToggleFavorite();
            }}
            disabled={isFavoriteLoading}
            className={`absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full transition-all duration-300 shadow-md hover:bg-rose-50 ${
              isFavoriteLoading ? "opacity-50 cursor-wait" : ""
            }`}
            title={isFavorite ? "Видалити з улюблених" : "Додати до улюблених"}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isFavorite
                  ? "text-rose-500 scale-110"
                  : "text-gray-400 hover:text-rose-400"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                animation: isFavorite ? "heartBeat 0.6s ease-in-out" : "none",
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

          {/* Price badge */}
          {card.price && typeof card.price === "number" && (
            <span className="absolute top-14 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-sm font-semibold text-rose-700 shadow-sm">
              €{card.price.toFixed(2)}
            </span>
          )}

          {/* Overlay with "Детальніше" text */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold bg-black/50 px-4 py-2 rounded-full">
              Детальніше →
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3
            className="text-xl font-bold text-rose-900 mb-1 line-clamp-1 cursor-pointer hover:text-rose-700 transition-colors"
            onClick={() => router.push(`/cards/${card._id}`)}
          >
            {card.name}
          </h3>

          {card.winery && (
            <p className="text-gray-500 text-sm mb-2">{card.winery}</p>
          )}

          <div className="flex items-center gap-2 mb-3 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                {getTypeLabel(card.type)}
              </span>
              {(card.year || card.anno) && (
                <span className="text-gray-500 text-sm">
                  {card.year || card.anno} р.
                </span>
              )}
              {card.alcohol && (
                <span className="text-gray-500 text-sm">{card.alcohol}%</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {card.description}
          </p>

          {/* Rating - 10 stars with 0.5 step */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`text-2xl font-bold ${getRatingColor(displayRating)}`}
                >
                  {displayRating.toFixed(1)}
                </div>
                <span className="text-xs text-gray-400">середній</span>
              </div>
              {currentUserId && userRating !== null && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-green-600">Ваш:</span>
                  <span
                    className={`text-lg font-bold ${getRatingColor(userRating)}`}
                  >
                    {userRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Rating Stars */}
            <div className="flex items-center gap-0.5">
              {stars.map((star) => {
                const starValue = star;
                const prevStarValue = star - 1;
                const isFull = currentRating >= starValue;
                const isHalf = !isFull && currentRating > prevStarValue;

                return (
                  <div key={star} className="relative group/star">
                    {/* Left half clickable */}
                    <div
                      className={`absolute left-0 top-0 w-1/2 h-full z-10 ${
                        isRatingLoading
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      style={{ width: "50%" }}
                      onMouseEnter={() =>
                        !isRatingLoading && setHoverRating(prevStarValue + 0.5)
                      }
                      onMouseLeave={() => !isRatingLoading && setHoverRating(0)}
                      onClick={() =>
                        !isRatingLoading && handleRate(prevStarValue + 0.5)
                      }
                    />
                    {/* Right half clickable */}
                    <div
                      className={`absolute right-0 top-0 w-1/2 h-full z-10 ${
                        isRatingLoading
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      style={{ left: "50%" }}
                      onMouseEnter={() =>
                        !isRatingLoading && setHoverRating(starValue)
                      }
                      onMouseLeave={() => !isRatingLoading && setHoverRating(0)}
                      onClick={() => !isRatingLoading && handleRate(starValue)}
                    />
                    <StarIcon filled={isFull} half={isHalf} />
                  </div>
                );
              })}
              {currentUserId && isRatingLoading && (
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Rating Count */}
          <div className="text-sm text-gray-500 mb-3">
            {card.ratingCount || card.ratings?.length || 0} оцінок
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {card.country && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                  className="w-4 h-4"
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

          {/* Edit Button for Author */}
          {isCardAuthor && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mt-4 w-full py-3 bg-rose-100 text-rose-700 rounded-lg font-semibold hover:bg-rose-200 transition-colors flex items-center justify-center gap-2"
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
              Редагувати
            </button>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditCardModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => {
          // Trigger refresh - the parent component will handle this via onRate or similar
        }}
      />
    </>
  );
}
