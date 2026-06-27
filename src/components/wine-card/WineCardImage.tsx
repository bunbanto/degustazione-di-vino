import Image from "next/image";
import Link from "next/link";
import { t } from "@/i18n/i18n";
import type { Lang } from "@/i18n/i18n";
import { withLang } from "@/i18n/routeUtils";
import { FavoriteButton } from "@/components/wine-card/FavoriteButton";
import { WineCardBadges } from "@/components/wine-card/WineCardBadges";
import type { WineCard } from "@/types";

interface WineCardImageProps {
  card: WineCard;
  imageUrl: string;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  lang: Lang;
  onImageOpen: () => void;
  onToggleFavorite: () => void;
}

export function WineCardImage({
  card,
  imageUrl,
  isFavorite,
  isFavoriteLoading,
  lang,
  onImageOpen,
  onToggleFavorite,
}: WineCardImageProps) {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-t-[32px] bg-gray-100 dark:bg-dark-800 flex items-center justify-center cursor-zoom-in"
      onClick={onImageOpen}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

      <Image
        src={imageUrl}
        alt={card.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-contain group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
      />

      <WineCardBadges card={card} lang={lang} />

      <FavoriteButton
        isFavorite={isFavorite}
        isLoading={isFavoriteLoading}
        lang={lang}
        onToggle={onToggleFavorite}
      />

      {card.price && typeof card.price === "number" && (
        <span className="absolute top-16 right-4 liquid-glass px-3 py-1.5 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 z-20">
          €{card.price.toFixed(2)}
        </span>
      )}

      <div className="absolute inset-0 bg-black/0 dark:bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center z-30">
        <Link
          href={withLang(`/cards/${card._id}`, lang)}
          onClick={(event) => event.stopPropagation()}
          className="text-white opacity-0 group-hover:opacity-100 transition-all duration-500 font-semibold liquid-glass px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 cursor-pointer"
        >
          {t(lang, "card.more")}
        </Link>
      </div>
    </div>
  );
}
