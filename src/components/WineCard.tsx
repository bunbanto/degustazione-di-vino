"use client";

import { WineCard as WineCardType } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import EditCardModal from "@/components/EditCardModal";
import { RatingLoader } from "@/components/Loaders";
import { getWineTypeLabel, getWineColorLabel } from "@/constants/wine";
import {
  getColorBadgeStyle,
  getRatingColor,
  getUserIdString,
  isCardAuthor as checkCardAuthor,
} from "@/lib/wineCardUtils";

interface WineCardProps {
  card: WineCardType;
  onRate?: (id: string, rating: number) => void;
  onToggleFavorite?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void> | void;
  onCardSaved?: () => Promise<void> | void;
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
        className="absolute top-0 left-0 w-full h-full text-gray-300 dark:text-gray-600"
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

export default function WineCardComponent({
  card,
  onRate,
  onToggleFavorite,
  onDelete,
  onCardSaved,
}: WineCardProps) {
  const router = useRouter();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  // Get current user from userStore
  const currentUser = useUserStore((state) => state.currentUser);
  const getUsername = useUserStore((state) => state.getUsername);
  const setUserName = useUserStore((state) => state.setUserName);

  // Favorite state - initialize from card prop
  const [isFavorite, setIsFavorite] = useState(!!card.isFavorite);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Refs для відстеження стану
  const previousRatingRef = useRef<number | null>(null);
  const previousFavoriteRef = useRef<boolean | null>(null);
  const isRatingRef = useRef(false);

  // Get current user ID from userStore
  const currentUserId = currentUser?.id?.toString() || currentUser?._id || null;
  const currentUserEmail = currentUser?.email || null;

  // Sync favorite state when card prop changes
  useEffect(() => {
    setIsFavorite(!!card.isFavorite);
    previousFavoriteRef.current = !!card.isFavorite;
  }, [card.isFavorite, card._id]);

  // Check if current user is the card author
  const isCardAuthor = checkCardAuthor(card, currentUserId, currentUserEmail);

  // Store all usernames from card ratings in Zustand store
  useEffect(() => {
    if (card.ratings && Array.isArray(card.ratings)) {
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
  }, [card.ratings, setUserName]);

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
    if (previousFavoriteRef.current === null) {
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
      setIsFavorite(previousFavoriteRef.current ?? isFavorite);
      previousFavoriteRef.current = null;
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

  const displayRating = card.rating || 0;
  // For visual stars, always use the average card rating as a base.
  // Personal rating is shown separately as "Ваш:" to avoid hiding half-stars.
  const currentRating = isRatingLoading ? displayRating : hoverRating || displayRating;
  const imageUrl =
    card.img ||
    card.image ||
    "https://res.cloudinary.com/demo/image/upload/wines/default.jpg";

  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      <div className="liquid-glass-heavy fluid-rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
        {/* Image container with glass overlay */}
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-t-[32px] bg-gray-100 dark:bg-dark-800 flex items-center justify-center"
          style={{ cursor: "zoom-in" }}
          onClick={() => setIsImageModalOpen(true)}
        >
          {/* Glass overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

          <Image
            src={imageUrl}
            alt={card.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-contain group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
          />

          {/* Glass badges */}
          <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-20">
            {card.color && (
              <div
                className={`${getColorBadgeStyle(card.color).bg} ${getColorBadgeStyle(card.color).text} backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium shadow-lg border border-white/20 ${getColorBadgeStyle(card.color).border || ""}`}
              >
                {getWineColorLabel(card.color)}
              </div>
            )}
            {card.frizzante && (
              <div className="bg-amber-500/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-lg border border-white/20">
                Frizzante
              </div>
            )}
          </div>

          {/* Glass Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleToggleFavorite();
            }}
            disabled={isFavoriteLoading}
            className={`absolute top-4 right-4 liquid-glass p-2.5 rounded-full transition-all duration-300 z-40 hover:scale-110 active:scale-95 ${
              isFavoriteLoading ? "opacity-50 cursor-wait" : ""
            }`}
            title={isFavorite ? "Видалити з улюблених" : "Додати до улюблених"}
          >
            <svg
              className={`w-5 h-5 transition-all duration-300 ${
                isFavorite
                  ? "text-rose-500 scale-110"
                  : "text-gray-500 dark:text-gray-400 hover:text-rose-500"
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

          {/* Glass Price badge */}
          {card.price && typeof card.price === "number" && (
            <span className="absolute top-16 right-4 liquid-glass px-3 py-1.5 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 z-20">
              €{card.price.toFixed(2)}
            </span>
          )}

          {/* Overlay with "Детальніше" text */}
          <div className="absolute inset-0 bg-black/0 dark:bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center z-30">
            <Link
              href={`/cards/${card._id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-white opacity-0 group-hover:opacity-100 transition-all duration-500 font-semibold liquid-glass px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 cursor-pointer"
            >
              Детальніше →
            </Link>
          </div>
        </div>

        {/* Content with liquid glass effect */}
        <div className="p-5">
          <h3
            className="text-xl font-bold text-rose-900 dark:text-rose-300 mb-1 line-clamp-1"
          >
            {card.name}
          </h3>

          {card.winery && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              {card.winery}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-rose-100/80 dark:bg-rose-900/50 backdrop-blur text-rose-800 dark:text-rose-300 rounded-full text-xs font-medium">
                {getWineTypeLabel(card.type)}
              </span>
              {(card.year || card.anno) && (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {card.year || card.anno} р.
                </span>
              )}
              {card.alcohol && (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {card.alcohol}%
                </span>
              )}
            </div>
          </div>

          {card.description ? (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2">
              {card.description}
            </p>
          ) : (
            <div className="h-[2.1rem] mb-5" />
          )}

          {/* Rating - 10 stars with liquid glass container */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`text-3xl font-bold ${getRatingColor(displayRating, "card")}`}
                >
                  {displayRating.toFixed(1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    середній
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({card.ratingCount || card.ratings?.length || 0})
                  </span>
                </div>
              </div>
              {currentUserId && userRating !== null && (
                <div className="flex items-center gap-2 liquid-glass px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Ваш:
                  </span>
                  <span
                    className={`text-lg font-bold ${getRatingColor(userRating, "card")}`}
                  >
                    {userRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Rating Stars with glass container */}
            <div className="flex items-center gap-0.5 liquid-glass rounded-xl p-2">
              {stars.map((star) => {
                const starValue = star;
                const prevStarValue = star - 1;
                const normalizedRating = Math.round(currentRating * 2) / 2;
                const isFull = normalizedRating >= starValue;
                const isHalf =
                  !isFull && normalizedRating >= prevStarValue + 0.5;

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
              {currentUserId && isRatingLoading && <RatingLoader />}
            </div>
          </div>

          {/* Additional Info with glass style */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {card.country && (
              <span className="flex items-center gap-1.5 liquid-glass px-2.5 py-1 rounded-full">
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
              <span className="flex items-center gap-1.5 liquid-glass px-2.5 py-1 rounded-full">
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

          {/* Edit Button for Author with liquid glass */}
          {isCardAuthor && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mt-5 w-full py-3 liquid-glass rounded-2xl font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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
          if (onCardSaved) {
            void onCardSaved();
          }
        }}
        onDeleted={async () => {
          if (onDelete) {
            await onDelete(card._id);
          }
        }}
      />

      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 liquid-glass rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all z-10"
            onClick={() => setIsImageModalOpen(false)}
            aria-label="Закрити модалку з фото"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="relative h-[90vh] w-[95vw] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={card.name}
              fill
              sizes="95vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
