"use client";

import { WineCard } from "@/types";
import Link from "next/link";
import { useState, useEffect } from "react";
import CommentsSection from "./CommentsSection";

interface WineCardModalProps {
  card: WineCard;
  isOpen: boolean;
  onClose: () => void;
}

// Rating display component for showing individual ratings
function RatingListItem({
  userId,
  username,
  rating,
  isCurrentUser,
}: {
  userId: string | { _id: string; name?: string };
  username: string;
  rating: number;
  isCurrentUser: boolean;
}) {
  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
          <span className="text-rose-600 font-medium text-sm">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">{username}</span>
          {isCurrentUser && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Ви
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const isFull = rating >= star;
          const isHalf = !isFull && rating >= star - 0.5;
          return (
            <svg
              key={star}
              className={`w-4 h-4 ${
                isFull || isHalf ? "text-yellow-400" : "text-gray-200"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
        <span className="ml-2 text-sm font-bold text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// Helper to get userId string from various formats
function getUserIdString(
  userId: string | { _id: string; name?: string },
): string {
  return typeof userId === "string" ? userId : userId._id;
}

// Helper function to get username from Zustand store
function getUsername(userId: string | { _id: string; name?: string }): string {
  if (typeof userId === "object" && userId.name) {
    return userId.name;
  }
  return "";
}

export default function WineCardModal({
  card,
  isOpen,
  onClose,
}: WineCardModalProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId =
          user.id?.toString() ||
          user._id?.toString() ||
          (user.id ? user.id.toString() : null) ||
          (user._id ? user._id.toString() : null) ||
          btoa(user.email || "").slice(0, 24);
        setCurrentUserId(userId);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  // Check if current user is the card author
  const isCardAuthor = (() => {
    if (!currentUserId) return false;

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

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    if (rating >= 4) return "text-orange-500";
    return "text-red-500";
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      secco: "Сухе",
      abboccato: "Напівсухе",
      amabile: "Напівсолодке",
      dolce: "Солодке",
    };
    return types[type] || type;
  };

  const getColorLabel = (color: string) => {
    const colors: Record<string, string> = {
      bianco: "Біле",
      rosso: "Червоне",
      rosato: "Рожеве",
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
        onClick={onClose}
      >
        <svg
          className="w-10 h-10"
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

      {/* Modal Content */}
      <div
        className="bg-white rounded-2xl w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Image */}
        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
          <div className="aspect-[4/3] w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-800">
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
        </div>

        {/* Right Side - Info */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-rose-900">{card.name}</h2>
            {card.winery && (
              <p className="text-rose-600 font-medium">{card.winery}</p>
            )}
          </div>

          {/* Rating Summary */}
          <div className="bg-amber-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`text-3xl font-bold ${getRatingColor(displayRating)}`}
                >
                  {displayRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  <div>із 10</div>
                  {/* <div>
                    ({card.ratingCount || card.ratings?.length || 0} оцінок)
                  </div> */}
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                  const isFull = displayRating >= star;
                  const isHalf = !isFull && displayRating >= star - 0.5;
                  return (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        isFull || isHalf ? "text-yellow-400" : "text-gray-200"
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
          </div>

          {/* Wine Details */}
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
                {getTypeLabel(card.type)}
              </span>
              <span
                className={`px-3 py-1 ${getColorBadgeStyle(card.color).bg} ${getColorBadgeStyle(card.color).text} rounded-full text-sm font-medium capitalize ${getColorBadgeStyle(card.color).border || ""}`}
              >
                {getColorLabel(card.color)}
              </span>
              {card.frizzante && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  Frizzante
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              {(card.year || card.anno) && (
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-gray-500 text-xs">Рік</div>
                  <div className="font-medium">{card.year || card.anno}</div>
                </div>
              )}
              {card.alcohol && (
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-gray-500 text-xs">Алкоголь</div>
                  <div className="font-medium">{card.alcohol}%</div>
                </div>
              )}
              {card.price && (
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-gray-500 text-xs">Ціна</div>
                  <div className="font-medium">
                    {typeof card.price === "number"
                      ? `€${card.price.toFixed(2)}`
                      : card.price}
                  </div>
                </div>
              )}
            </div>

            {(card.country || card.region) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
            )}
          </div>

          {/* Description */}
          {card.description && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Опис</h4>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </div>
          )}

          {/* All Ratings List */}
          {card.ratings && card.ratings.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">
                Оцінки користувачів ({card.ratings.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {card.ratings.map((rating, idx) => {
                  const userIdStr = getUserIdString(rating.userId || "");
                  const displayUsername =
                    typeof rating.userId === "object" && rating.userId.name
                      ? rating.userId.name
                      : rating.username || getUsername(rating.userId || "");

                  return (
                    <RatingListItem
                      key={idx}
                      userId={rating.userId || ""}
                      username={displayUsername}
                      rating={rating.value}
                      isCurrentUser={userIdStr === currentUserId}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-4 mt-4">
            <CommentsSection
              cardId={card._id}
              currentUserId={currentUserId || undefined}
            />
          </div>

          {/* Edit Button */}
          {isCardAuthor && (
            <Link
              href={`/cards/${card._id}`}
              className="mt-4 w-full py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
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
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
