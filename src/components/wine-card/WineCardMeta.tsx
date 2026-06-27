import { getWineTypeLabel, isWineDrinkType } from "@/constants/wine";
import type { Lang } from "@/i18n/i18n";
import type { WineCard } from "@/types";

interface WineCardMetaProps {
  card: WineCard;
  displayVolume: string | null;
  lang: Lang;
}

export function WineCardMeta({ card, displayVolume, lang }: WineCardMetaProps) {
  const showWineFields = isWineDrinkType(card.type);

  return (
    <>
      <div className="flex items-center gap-2 mb-4 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-rose-100/80 dark:bg-rose-900/50 backdrop-blur text-rose-800 dark:text-rose-300 rounded-full text-xs font-medium">
            {getWineTypeLabel(card.type, lang)}
          </span>
          {(card.year || card.anno) && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {card.year || card.anno}
            </span>
          )}
          {card.alcohol && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {card.alcohol}%
            </span>
          )}
          {displayVolume && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {displayVolume}
            </span>
          )}
        </div>
      </div>

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
        {showWineFields && card.region && (
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
    </>
  );
}
