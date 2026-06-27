import { t } from "@/i18n/i18n";
import type { Lang } from "@/i18n/i18n";

interface FavoriteButtonProps {
  isFavorite: boolean;
  isLoading: boolean;
  lang: Lang;
  onToggle: () => void;
}

export function FavoriteButton({
  isFavorite,
  isLoading,
  lang,
  onToggle,
}: FavoriteButtonProps) {
  const label = isFavorite
    ? t(lang, "card.favorite.remove")
    : t(lang, "card.favorite.add");

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onToggle();
      }}
      disabled={isLoading}
      className={`absolute top-4 right-4 liquid-glass p-2.5 rounded-full transition-all duration-300 z-40 hover:scale-110 active:scale-95 ${
        isLoading ? "opacity-50 cursor-wait" : ""
      }`}
      title={label}
      aria-label={label}
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
  );
}
