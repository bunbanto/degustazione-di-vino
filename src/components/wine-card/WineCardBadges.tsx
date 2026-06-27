import {
  getWineColorLabel,
  hasDrinkColorOptions,
  isBeerDrinkType,
  isWineDrinkType,
} from "@/constants/wine";
import { t } from "@/i18n/i18n";
import type { Lang } from "@/i18n/i18n";
import { getColorBadgeStyle } from "@/lib/wineCardUtils";
import type { WineCard } from "@/types";

interface WineCardBadgesProps {
  card: WineCard;
  lang: Lang;
}

export function WineCardBadges({ card, lang }: WineCardBadgesProps) {
  const showWineFields = isWineDrinkType(card.type);
  const showBeerFields = isBeerDrinkType(card.type);
  const showColorFields = hasDrinkColorOptions(card.type);
  const colorBadgeStyle = card.color ? getColorBadgeStyle(card.color) : null;

  return (
    <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-20">
      {showColorFields && card.color && colorBadgeStyle && (
        <div
          className={`${colorBadgeStyle.bg} ${colorBadgeStyle.text} backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium shadow-lg border border-white/20 ${colorBadgeStyle.border || ""}`}
        >
          {getWineColorLabel(card.color, lang)}
        </div>
      )}
      {showWineFields && card.frizzante && (
        <div className="bg-amber-500/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-lg border border-white/20">
          Frizzante
        </div>
      )}
      {showBeerFields && card.unfiltered && (
        <div className="bg-amber-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-lg border border-white/20">
          {t(lang, "filter.unfiltered")}
        </div>
      )}
    </div>
  );
}
