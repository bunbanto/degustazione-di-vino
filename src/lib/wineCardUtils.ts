import { WineCard } from "@/types";

type UserIdLike =
  | string
  | { _id?: string; id?: string | number; name?: string }
  | null
  | undefined;

type RatingColorVariant = "card" | "details" | "modal";

export function getUserIdString(userId: UserIdLike): string {
  if (!userId) return "";
  if (typeof userId === "string") return userId;
  return (
    userId._id?.toString() ||
    (userId.id !== undefined ? userId.id.toString() : "")
  );
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
    const ownerId = typeof card.owner === "object" ? card.owner._id : card.owner;
    const ownerEmail =
      typeof card.owner === "object" ? (card.owner.email ?? null) : null;

    if (currentUserId && ownerId && currentUserId === ownerId.toString()) {
      return true;
    }

    if (currentUserEmail && ownerEmail && currentUserEmail === ownerEmail) {
      return true;
    }

    return false;
  }

  if (card.authorId !== undefined && card.authorId !== null) {
    return currentUserId === card.authorId.toString();
  }

  return false;
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
  const styles: Record<string, { bg: string; text: string; border?: string }> = {
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
  };

  return (
    styles[color] || {
      bg: "bg-gray-200 dark:bg-gray-700",
      text: "text-gray-800 dark:text-gray-200",
    }
  );
}
