import { useCallback, useEffect, useRef, useState } from "react";
import type { WineCard } from "@/types";
import { getUserIdString } from "@/lib/wineCardUtils";

interface UseWineCardStateOptions {
  card: WineCard;
  currentUserId: string | null;
  onRate?: (id: string, rating: number) => Promise<void> | void;
  onToggleFavorite?: (id: string) => Promise<void>;
  requireAuth: () => void;
}

export function useWineCardState({
  card,
  currentUserId,
  onRate,
  onToggleFavorite,
  requireAuth,
}: UseWineCardStateOptions) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(!!card.isFavorite);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const previousRatingRef = useRef<number | null>(null);
  const previousFavoriteRef = useRef<boolean | null>(null);
  const isRatingRef = useRef(false);

  useEffect(() => {
    setIsFavorite(!!card.isFavorite);
    previousFavoriteRef.current = !!card.isFavorite;
  }, [card.isFavorite, card._id]);

  useEffect(() => {
    if (isRatingRef.current) {
      return;
    }

    if (Array.isArray(card.ratings) && currentUserId) {
      const userRatingObj = card.ratings.find((rating) => {
        return getUserIdString(rating.userId) === currentUserId;
      });

      setUserRating(userRatingObj?.value ?? null);
      return;
    }

    if (!card.ratings || card.ratings.length === 0) {
      setUserRating(null);
    }
  }, [card.ratings, currentUserId]);

  const handleToggleFavorite = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      requireAuth();
      return;
    }

    if (previousFavoriteRef.current === null) {
      previousFavoriteRef.current = isFavorite;
    }

    setIsFavoriteLoading(true);
    setIsFavorite(!isFavorite);

    try {
      await onToggleFavorite?.(card._id);
      previousFavoriteRef.current = null;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsFavorite(previousFavoriteRef.current ?? isFavorite);
      previousFavoriteRef.current = null;
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [card._id, isFavorite, onToggleFavorite, requireAuth]);

  const handleRate = useCallback(
    async (rating: number) => {
      if (!currentUserId) {
        requireAuth();
        return;
      }

      if (isRatingRef.current || isRatingLoading) {
        return;
      }

      if (previousRatingRef.current === null) {
        previousRatingRef.current = userRating;
      }

      isRatingRef.current = true;
      setUserRating(rating);
      setIsRatingLoading(true);

      if (!onRate) {
        isRatingRef.current = false;
        setIsRatingLoading(false);
        return;
      }

      try {
        await onRate(card._id, rating);
        previousRatingRef.current = null;
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
    },
    [
      card._id,
      currentUserId,
      isRatingLoading,
      onRate,
      requireAuth,
      userRating,
    ],
  );

  return {
    userRating,
    hoverRating,
    isRatingLoading,
    isFavorite,
    isFavoriteLoading,
    setHoverRating,
    handleRate,
    handleToggleFavorite,
  };
}
