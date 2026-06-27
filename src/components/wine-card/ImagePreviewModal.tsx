import Image from "next/image";
import { t } from "@/i18n/i18n";
import type { Lang } from "@/i18n/i18n";

interface ImagePreviewModalProps {
  imageUrl: string;
  imageAlt: string;
  lang: Lang;
  onClose: () => void;
}

export function ImagePreviewModal({
  imageUrl,
  imageAlt,
  lang,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 liquid-glass rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all z-10"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label={t(lang, "card.closeImage")}
      >
        <svg
          className="w-8 h-8"
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
      <div
        className="relative h-[90vh] w-[95vw] max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="95vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
