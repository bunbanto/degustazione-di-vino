import { RatingLoader } from "@/components/Loaders";

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function StarIcon({ fillPercentage }: { fillPercentage: number }) {
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
        className="absolute top-0 left-0 w-full h-full text-yellow-400"
        viewBox="0 0 20 20"
        style={
          fillPercentage < 100
            ? {
                clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
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
  const safeRating = Math.max(0, Math.min(10, currentRating));

  const commitRating = (value: string) => {
    const rating = Math.round(Number(value) * 10) / 10;
    if (Number.isFinite(rating)) {
      onRate(rating);
    }
  };

  return (
    <div className="w-full liquid-glass rounded-xl p-2">
      <div className="flex items-center justify-between" aria-hidden="true">
        {STARS.map((star) => (
          <StarIcon
            key={star}
            fillPercentage={Math.max(0, Math.min(1, safeRating - (star - 1))) * 100}
          />
        ))}
        {isAuthenticated && isLoading && <RatingLoader />}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={safeRating}
          disabled={isLoading}
          aria-label="Rate this wine from 0 to 10"
          className="min-w-0 flex-1 accent-yellow-400 disabled:cursor-not-allowed"
          onChange={(event) => onHover(Number(event.target.value))}
          onPointerUp={(event) => commitRating(event.currentTarget.value)}
          onKeyUp={(event) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
              commitRating(event.currentTarget.value);
            }
          }}
          onBlur={() => onHover(0)}
        />
        <output
          aria-live="polite"
          className="shrink-0 rounded-lg bg-yellow-400/15 px-2.5 py-1 text-sm font-bold tabular-nums text-yellow-700 dark:text-yellow-300"
        >
          {safeRating.toFixed(1)}<span className="ml-0.5 text-xs font-medium opacity-70">/10</span>
        </output>
      </div>
    </div>
  );
}
