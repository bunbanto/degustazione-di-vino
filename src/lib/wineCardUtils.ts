import { WineCard } from "@/types";
import type { User } from "@/types";
import { normalizeDrinkColor, normalizeWineStyle } from "@/constants/wine";

type UserIdLike =
  | string
  | { _id?: string; id?: string | number; name?: string }
  | null
  | undefined;

type RatingColorVariant = "card" | "details" | "modal";
const ADMIN_EMAIL = "bunbanto@gmail.com";

function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() || "";
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export function isAdminUser(
  user: Pick<User, "email" | "role"> | null,
): boolean {
  return !!user && (isAdminEmail(user.email) || user.role === "admin");
}

export function getUserRole(
  user: Pick<User, "email"> & { role?: string | null },
): "admin" | "user" {
  return isAdminEmail(user.email) || user.role === "admin" ? "admin" : "user";
}

export function getUserIdString(userId: UserIdLike): string {
  if (!userId) return "";
  if (typeof userId === "string") return userId;
  return (
    userId._id?.toString() ||
    (userId.id !== undefined ? userId.id.toString() : "")
  );
}

export function getDisplayRating(
  card: Pick<WineCard, "rating" | "ratings">,
): number {
  if (Array.isArray(card.ratings) && card.ratings.length > 0) {
    const validRatings = card.ratings
      .map((rating) => Number(rating.value))
      .filter((value) => Number.isFinite(value));

    if (validRatings.length > 0) {
      const sum = validRatings.reduce((acc, value) => acc + value, 0);
      return Math.round((sum / validRatings.length) * 10) / 10;
    }
  }

  const fallback = Number(card.rating);
  return Number.isFinite(fallback) ? fallback : 0;
}

export function getDisplayRatingCount(
  card: Pick<WineCard, "ratingCount" | "ratings">,
): number {
  if (Array.isArray(card.ratings) && card.ratings.length > 0) {
    return card.ratings.length;
  }

  const fallback = Number(card.ratingCount);
  return Number.isFinite(fallback) ? fallback : 0;
}

export function getDisplayVolume(
  card: Pick<WineCard, "volume">,
): string | null {
  if (card.volume === undefined || card.volume === null || card.volume === "") {
    return null;
  }

  const volume = Number(card.volume);

  if (!Number.isFinite(volume) || volume <= 0) {
    return null;
  }

  return Number.isInteger(volume) ? `${volume} ml` : `${volume.toFixed(2)} ml`;
}

export function normalizeRatingForStars(rating: number): number {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const clampedRating = Math.max(0, Math.min(10, safeRating));
  const integerPart = Math.floor(clampedRating);
  const fractionalPart = clampedRating - integerPart;
  const epsilon = 1e-9;

  if (fractionalPart < 0.5 - epsilon) {
    return integerPart;
  }

  if (Math.abs(fractionalPart - 0.5) <= epsilon) {
    return integerPart + 0.5;
  }

  return integerPart + 1;
}

export function isCardAuthor(
  card: WineCard | null,
  currentUserId: string | null,
  currentUserEmail: string | null = null,
): boolean {
  if (!card || (!currentUserId && !currentUserEmail)) {
    return false;
  }

  if (card.owner) {
    const ownerId =
      typeof card.owner === "object" ? card.owner._id : card.owner;
    const ownerEmail =
      typeof card.owner === "object" ? (card.owner.email ?? null) : null;

    if (currentUserId && ownerId && currentUserId === ownerId.toString()) {
      return true;
    }

    if (
      currentUserEmail &&
      ownerEmail &&
      normalizeEmail(currentUserEmail) === normalizeEmail(ownerEmail)
    ) {
      return true;
    }

    return false;
  }

  if (card.authorId !== undefined && card.authorId !== null) {
    return currentUserId === card.authorId.toString();
  }

  return false;
}

export function canManageCard(
  card: WineCard | null,
  currentUser: Pick<User, "id" | "_id" | "email" | "role"> | null,
): boolean {
  if (isAdminUser(currentUser)) {
    return true;
  }

  const currentUserId =
    currentUser?.id?.toString() || currentUser?._id?.toString() || null;

  return isCardAuthor(card, currentUserId, currentUser?.email ?? null);
}

export function getRatingColor(
  rating: number,
  variant: RatingColorVariant = "card",
): string {
  if (variant === "modal") {
    if (rating >= 8) return "text-green-500";
    if (rating >= 6) return "text-yellow-500";
    if (rating >= 4) return "text-orange-500";
    return "text-red-500";
  }

  if (variant === "details") {
    if (rating >= 8) return "text-green-600 dark:text-green-500";
    if (rating >= 6) return "text-yellow-600 dark:text-yellow-500";
    if (rating >= 4) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  }

  if (rating >= 8) return "text-green-500 dark:text-green-400";
  if (rating >= 6) return "text-yellow-600 dark:text-yellow-500";
  if (rating >= 4) return "text-orange-500";
  return "text-red-500 dark:text-red-400";
}

export function getColorBadgeStyle(color: string): {
  bg: string;
  text: string;
  border?: string;
} {
  const normalizedColor = normalizeDrinkColor(color) || color;
  const styles: Record<string, { bg: string; text: string; border?: string }> =
    {
      rosso: { bg: "bg-red-600", text: "text-white" },
      bianco: {
        bg: "bg-yellow-50 dark:bg-yellow-900/30",
        text: "text-gray-800 dark:text-gray-200",
        border: "border border-gray-200 dark:border-gray-700",
      },
      rosato: {
        bg: "bg-pink-100 dark:bg-pink-900/30",
        text: "text-gray-800 dark:text-gray-200",
      },
      light: {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-900 dark:text-amber-200",
        border: "border border-amber-200 dark:border-amber-700",
      },
      dark: {
        bg: "bg-stone-800 dark:bg-stone-950",
        text: "text-white dark:text-stone-100",
        border: "border border-stone-700 dark:border-stone-600",
      },
    };

  return (
    styles[normalizedColor] || {
      bg: "bg-gray-200 dark:bg-gray-700",
      text: "text-gray-800 dark:text-gray-200",
    }
  );
}

export function getWineStyleBadgeStyle(style?: string): {
  bg: string;
  text: string;
  border: string;
} {
  const normalizedStyle = normalizeWineStyle(style) || style || "";
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    secco: {
      bg: "bg-yellow-700/85 dark:bg-yellow-500/20",
      text: "text-white dark:text-yellow-100",
      border: "border border-yellow-100/30 dark:border-yellow-300/25",
    },
    abboccato: {
      bg: "bg-amber-500/90 dark:bg-amber-500/25",
      text: "text-white dark:text-amber-100",
      border: "border border-amber-100/35 dark:border-amber-300/25",
    },
    amabile: {
      bg: "bg-rose-500/90 dark:bg-rose-500/25",
      text: "text-white dark:text-rose-100",
      border: "border border-rose-100/35 dark:border-rose-300/25",
    },
    dolce: {
      bg: "bg-fuchsia-700/85 dark:bg-fuchsia-500/25",
      text: "text-white dark:text-fuchsia-100",
      border: "border border-fuchsia-100/30 dark:border-fuchsia-300/25",
    },
  };

  return (
    styles[normalizedStyle] || {
      bg: "bg-rose-500/90 dark:bg-rose-500/25",
      text: "text-white dark:text-rose-100",
      border: "border border-rose-100/35 dark:border-rose-300/25",
    }
  );
}
