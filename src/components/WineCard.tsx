"use client";

import { WineCard } from "@/types";
import { useState } from "react";
import Link from "next/link";

interface WineCardProps {
  card: WineCard;
  onRate?: (id: string, rating: number) => void;
}

export default function WineCardComponent({ card, onRate }: WineCardProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleRate = (rating: number) => {
    setUserRating(rating);
    if (onRate) {
      onRate(card._id, rating);
    }
  };

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

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              card.img ||
              card.image ||
              "https://res.cloudinary.com/demo/image/upload/wines/default.jpg"
            }
            alt={card.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-rose-700 shadow-md">
            {card.price && typeof card.price === "number"
              ? `€${card.price.toFixed(2)}`
              : ""}
          </div>
          {card.color && (
            <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white shadow-md capitalize">
              {getColorLabel(card.color)}
            </div>
          )}
          {/* Edit Button */}
          <Link
            href={`/cards/${card._id}`}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-50"
            title="Редагувати"
          >
            <svg
              className="w-5 h-5 text-rose-600"
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
          </Link>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-rose-900 mb-1 line-clamp-1">
            {card.name}
          </h3>

          {card.winery && (
            <p className="text-gray-500 text-sm mb-2">{card.winery}</p>
          )}

          <div className="flex items-center gap-2 mb-3">
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

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {card.description}
          </p>

          {/* Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`text-2xl font-bold ${getRatingColor(card.rating)}`}
              >
                {card.rating.toFixed(1)}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-0.5"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        star <= (hoverRating || userRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {card.ratingCount || card.ratings?.length || 0} оцінок
            </span>
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
        </div>
      </div>

      {/* Image Modal - rendered outside card to allow full viewport */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-0"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            onClick={() => setIsImageModalOpen(false)}
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
          <img
            src={
              card.img ||
              card.image ||
              "https://res.cloudinary.com/demo/image/upload/wines/default.jpg"
            }
            alt={card.name}
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
            <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg">
              <h3 className="text-xl font-bold">{card.name}</h3>
              {card.winery && <p className="text-rose-200">{card.winery}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
