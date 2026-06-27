import { RatingLoader } from "@/components/Loaders";
import { normalizeRatingForStars } from "@/lib/wineCardUtils";

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function StarIcon({ filled, half = false }: { filled: boolean; half?: boolean }) {
  return (
    <span className="relative block w-5 h-5" aria-hidden="true">
      <svg
        className="absolute top-0 left-0 w-full h-full text-gray-300 dark:text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <svg
        className={`absolute top-0 left-0 w-full h-full ${
          filled || half ? "text-yellow-400" : "text-transparent"
        }`}
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
    </span>
  );
}

interface RatingStarsProps {
  currentRating: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  onHover: (rating: number) => void;
  onRate: (rating: number) => void;
}

export function RatingStars({
  currentRating,
  isLoading,
  isAuthenticated,
  onHover,
  onRate,
}: RatingStarsProps) {
  const normalizedRating = normalizeRatingForStars(currentRating);

  return (
    <div className="flex items-center gap-0.5 liquid-glass rounded-xl p-2">
      {STARS.map((star) => {
        const previousStarValue = star - 1;
        const isFull = normalizedRating >= star;
        const isHalf = !isFull && normalizedRating >= previousStarValue + 0.5;
        const leftHalfRating = previousStarValue + 0.5;
        const disabledClass = isLoading ? "cursor-not-allowed" : "cursor-pointer";

        return (
          <span key={star} className="relative group/star">
            <button
              type="button"
              className={`absolute left-0 top-0 w-1/2 h-full z-10 rounded-l-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${disabledClass}`}
              disabled={isLoading}
              aria-label={`Rate ${leftHalfRating} of 10`}
              onMouseEnter={() => !isLoading && onHover(leftHalfRating)}
              onMouseLeave={() => !isLoading && onHover(0)}
              onFocus={() => !isLoading && onHover(leftHalfRating)}
              onBlur={() => !isLoading && onHover(0)}
              onClick={() => !isLoading && onRate(leftHalfRating)}
            />
            <button
              type="button"
              className={`absolute right-0 top-0 w-1/2 h-full z-10 rounded-r-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${disabledClass}`}
              disabled={isLoading}
              aria-label={`Rate ${star} of 10`}
              onMouseEnter={() => !isLoading && onHover(star)}
              onMouseLeave={() => !isLoading && onHover(0)}
              onFocus={() => !isLoading && onHover(star)}
              onBlur={() => !isLoading && onHover(0)}
              onClick={() => !isLoading && onRate(star)}
            />
            <StarIcon filled={isFull} half={isHalf} />
          </span>
        );
      })}
      {isAuthenticated && isLoading && <RatingLoader />}
    </div>
  );
}
