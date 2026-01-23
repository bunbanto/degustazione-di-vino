/**
 * Optimistic Update - Утиліти для оптимістичних оновлень
 * Дозволяє оновлювати UI одразу, потім синхронізувати з сервером
 */

import { WineCard } from "@/types";

// Тип для функції відновлення при помилці
export type RollbackFn<T> = () => T;

// Менеджер для відстеження оптимістичних оновлень
class OptimisticUpdateManager {
  private pendingUpdates: Map<
    string,
    { rollback: RollbackFn<unknown>; timestamp: number }
  > = new Map();

  /**
   * Додати оптимістичне оновлення
   */
  add(key: string, rollback: RollbackFn<unknown>): void {
    this.pendingUpdates.set(key, { rollback, timestamp: Date.now() });
  }

  /**
   * Видалити оптимістичне оновлення
   */
  remove(key: string): void {
    this.pendingUpdates.delete(key);
  }

  /**
   * Відкатити оновлення
   */
  rollback(key: string): void {
    const update = this.pendingUpdates.get(key);
    if (update) {
      update.rollback();
      this.pendingUpdates.delete(key);
    }
  }

  /**
   * Відкатити всі оновлення
   */
  rollbackAll(): void {
    this.pendingUpdates.forEach((_, key) => {
      this.rollback(key);
    });
  }

  /**
   * Отримати кількість активних оновлень
   */
  getCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * Перевірити чи є активне оновлення
   */
  has(key: string): boolean {
    return this.pendingUpdates.has(key);
  }

  /**
   * Очистити всі оновлення старші за timeout
   */
  cleanup(maxAge: number = 30000): void {
    const now = Date.now();
    const entries = Array.from(this.pendingUpdates.entries());
    for (const [key, update] of entries) {
      if (now - update.timestamp > maxAge) {
        this.pendingUpdates.delete(key);
      }
    }
  }
}

// Глобальний менеджер
export const optimisticManager = new OptimisticUpdateManager();

/**
 * Хук для управління оптимістичним станом
 */
export function createOptimisticState<T>(
  initialValue: T,
  key: string,
): {
  value: T;
  set: (newValue: T, rollback: RollbackFn<T>) => void;
  reset: () => void;
  commit: () => void;
} {
  const current = { current: initialValue };

  return {
    get value() {
      return current.current;
    },
    set: (newValue: T, rollback: RollbackFn<T>) => {
      current.current = newValue;
      optimisticManager.add(key, rollback);
    },
    reset: () => {
      current.current = initialValue;
      optimisticManager.remove(key);
    },
    commit: () => {
      optimisticManager.remove(key);
    },
  };
}

/**
 * Утиліта для створення оптимістичного оновлення рейтингу
 */
export function createOptimisticRatingUpdate(
  cards: WineCard[],
  cardId: string,
  newRating: number,
): {
  updatedCards: WineCard[];
  rollback: () => WineCard[];
} {
  const previousCards = [...cards];

  // Отримуємо поточного користувача для ідентифікації
  let currentUserId = null;
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUserId = user.id?.toString() || user._id?.toString();
      }
    } catch (e) {
      console.error("Error getting user:", e);
    }
  }

  const updatedCards = cards.map((card) => {
    if (card._id !== cardId) {
      return card;
    }

    // Створюємо копію ratings
    const newRatings = card.ratings ? [...card.ratings] : [];

    // Знаходимо індекс існуючої оцінки користувача
    const existingRatingIndex = currentUserId
      ? newRatings.findIndex((r) => {
          const rUserId =
            typeof r.userId === "object" ? r.userId._id : r.userId;
          return rUserId === currentUserId;
        })
      : -1;

    // Оновлюємо або додаємо оцінку
    if (existingRatingIndex !== -1) {
      newRatings[existingRatingIndex] = {
        ...newRatings[existingRatingIndex],
        value: newRating,
      };
    } else if (currentUserId) {
      newRatings.push({
        userId: { _id: currentUserId },
        value: newRating,
        username: "",
      });
    }

    // Перераховуємо середній рейтинг
    const totalRating = newRatings.reduce((acc, curr) => acc + curr.value, 0);
    const newAverageRating = parseFloat(
      (totalRating / newRatings.length).toFixed(1),
    );

    return {
      ...card,
      rating: newAverageRating,
      ratings: newRatings,
    };
  });

  return {
    updatedCards,
    rollback: () => previousCards,
  };
}

/**
 * Утиліта для створення оптимістичного оновлення улюблених
 */
export function createOptimisticFavoriteUpdate(
  cards: WineCard[],
  cardId: string,
): {
  updatedCards: WineCard[];
  rollback: () => WineCard[];
} {
  const previousCards = [...cards];

  const updatedCards = cards.map((card) => {
    if (card._id === cardId) {
      return {
        ...card,
        isFavorite: !card.isFavorite,
      };
    }
    return card;
  });

  return {
    updatedCards,
    rollback: () => previousCards,
  };
}

/**
 * Утиліта для створення оптимістичного видалення картки
 */
export function createOptimisticDelete(
  cards: WineCard[],
  cardId: string,
): {
  updatedCards: WineCard[];
  rollback: () => WineCard[];
} {
  const previousCards = [...cards];
  const updatedCards = cards.filter((card) => card._id !== cardId);

  return {
    updatedCards,
    rollback: () => previousCards,
  };
}

/**
 * Утиліта для створення оптимістичного додавання картки
 */
export function createOptimisticAdd(
  cards: WineCard[],
  newCard: WineCard,
): {
  updatedCards: WineCard[];
  rollback: () => WineCard[];
} {
  const previousCards = [...cards];
  const updatedCards = [newCard, ...cards];

  return {
    updatedCards,
    rollback: () => previousCards,
  };
}

export default OptimisticUpdateManager;
