import { t } from "@/i18n/i18n";
import type { Lang } from "@/i18n/i18n";
import { getRatingColor } from "@/lib/wineCardUtils";
import { RatingStars } from "@/components/wine-card/RatingStars";

interface WineCardRatingProps {
  displayRating: number;
  displayRatingCount: number;
  currentRating: number;
  userRating: number | null;
  isAuthenticated: boolean;
  isRatingLoading: boolean;
  lang: Lang;
  onHover: (rating: number) => void;
  onRate: (rating: number) => void;
}

export function WineCardRating({
  displayRating,
  displayRatingCount,
  currentRating,
  userRating,
  isAuthenticated,
  isRatingLoading,
  lang,
  onHover,
  onRate,
}: WineCardRatingProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`text-3xl font-bold ${getRatingColor(
              displayRating,
              "card",
            )}`}
          >
            {displayRating.toFixed(1)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {t(lang, "card.average")}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({displayRatingCount})
            </span>
          </div>
        </div>
        {isAuthenticated && userRating !== null && (
          <div className="flex items-center gap-2 liquid-glass px-3 py-1.5 rounded-xl">
            <span className="text-xs text-green-600 dark:text-green-400">
              {t(lang, "card.yourRating")}
            </span>
            <span
              className={`text-lg font-bold ${getRatingColor(
                userRating,
                "card",
              )}`}
            >
              {userRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <RatingStars
        currentRating={currentRating}
        isLoading={isRatingLoading}
        isAuthenticated={isAuthenticated}
        onHover={onHover}
        onRate={onRate}
      />
    </div>
  );
}
