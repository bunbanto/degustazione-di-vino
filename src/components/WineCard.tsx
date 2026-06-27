"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import EditCardModal from "@/components/EditCardModal";
import { ImagePreviewModal } from "@/components/wine-card/ImagePreviewModal";
import { WineCardImage } from "@/components/wine-card/WineCardImage";
import { WineCardMeta } from "@/components/wine-card/WineCardMeta";
import { WineCardRating } from "@/components/wine-card/WineCardRating";
import { useWineCardState } from "@/components/wine-card/useWineCardState";
import { t } from "@/i18n/i18n";
import { getLangFromPath, withLang } from "@/i18n/routeUtils";
import {
  canManageCard,
  getDisplayRating,
  getDisplayRatingCount,
  getDisplayVolume,
  getUserIdString,
} from "@/lib/wineCardUtils";
import { useUserStore } from "@/store/userStore";
import type { WineCard as WineCardType } from "@/types";

interface WineCardProps {
  card: WineCardType;
  onRate?: (id: string, rating: number) => Promise<void> | void;
  onToggleFavorite?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void> | void;
  onCardSaved?: () => Promise<void> | void;
}

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/demo/image/upload/wines/default.jpg";

export default function WineCardComponent({
  card,
  onRate,
  onToggleFavorite,
  onDelete,
  onCardSaved,
}: WineCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);

  const currentUser = useUserStore((state) => state.currentUser);
  const setUserName = useUserStore((state) => state.setUserName);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const currentUserId = currentUser?.id?.toString() || currentUser?._id || null;
  const canManageCurrentCard = canManageCard(card, currentUser);
  const displayRating = getDisplayRating(card);
  const displayRatingCount = getDisplayRatingCount(card);
  const displayVolume = getDisplayVolume(card);
  const imageUrl = card.img || card.image || DEFAULT_IMAGE_URL;

  const requireAuth = useCallback(() => {
    router.push(withLang("/login", lang));
  }, [lang, router]);

  const {
    userRating,
    hoverRating,
    isRatingLoading,
    isFavorite,
    isFavoriteLoading,
    setHoverRating,
    handleRate,
    handleToggleFavorite,
  } = useWineCardState({
    card,
    currentUserId,
    onRate,
    onToggleFavorite,
    requireAuth,
  });

  useEffect(() => {
    if (!Array.isArray(card.ratings)) {
      return;
    }

    card.ratings.forEach((rating) => {
      if (!rating.userId) {
        return;
      }

      const userIdStr = getUserIdString(rating.userId);

      if (typeof rating.userId === "object" && rating.userId.name) {
        setUserName(userIdStr, rating.userId.name);
      } else if (rating.username) {
        setUserName(userIdStr, rating.username);
      }
    });
  }, [card.ratings, setUserName]);

  const handleCardSaved = useCallback(() => {
    void onCardSaved?.();
  }, [onCardSaved]);

  const handleCardDeleted = useCallback(async () => {
    await onDelete?.(card._id);
  }, [card._id, onDelete]);

  return (
    <>
      <div className="liquid-glass-heavy fluid-rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
        <WineCardImage
          card={card}
          imageUrl={imageUrl}
          isFavorite={isFavorite}
          isFavoriteLoading={isFavoriteLoading}
          lang={lang}
          onImageOpen={() => setIsImageModalOpen(true)}
          onToggleFavorite={handleToggleFavorite}
        />

        <div className="p-5">
          <h3 className="text-xl font-bold text-rose-900 dark:text-rose-300 mb-1 line-clamp-1">
            {card.name}
          </h3>

          {card.winery && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              {card.winery}
            </p>
          )}

          <WineCardMeta card={card} displayVolume={displayVolume} lang={lang} />

          {card.description ? (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2">
              {card.description}
            </p>
          ) : (
            <div className="h-[2.1rem] mb-5" />
          )}

          <WineCardRating
            displayRating={displayRating}
            displayRatingCount={displayRatingCount}
            currentRating={hoverRating || userRating || 0}
            userRating={userRating}
            isAuthenticated={!!currentUserId}
            isRatingLoading={isRatingLoading}
            lang={lang}
            onHover={setHoverRating}
            onRate={handleRate}
          />

          {canManageCurrentCard && (
            <button
              type="button"
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
              {t(lang, "card.editShort")}
            </button>
          )}
        </div>
      </div>

      <EditCardModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleCardSaved}
        onDeleted={handleCardDeleted}
      />

      {isImageModalOpen && (
        <ImagePreviewModal
          imageUrl={imageUrl}
          imageAlt={card.name}
          lang={lang}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </>
  );
}
