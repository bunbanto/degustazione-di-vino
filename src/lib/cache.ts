/**
 * HybridCache - Гібридне кешування з localStorage та TTL підтримкою
 * Підтримує офлайн режим та stale-while-revalidate патерн
 */

// Типи для конфігурації кешу
export interface CacheConfig {
  defaultTTL: number; // За замовчуванням 5 хвилин
  cardsTTL: number; // Список карток - 5 хвилин
  cardDetailTTL: number; // Деталі картки - 10 хвилин
  favoritesTTL: number; // Улюблені - 2 хвилини
  userTTL: number; // Дані користувача - 1 година
  commentsTTL: number; // Коментарі - 5 хвилин
  maxCacheSize: number; // Максимальний розмір кешу в байтах (10MB)
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // в мілісекундах
  key: string;
  version: string; // Версія для інвалідації
}

export interface CacheResult<T> {
  data: T | null;
  fromCache: boolean;
  isStale: boolean; // Дані застарілі, але ще可用
  needsRevalidate: boolean;
}

// Конфігурація за замовчуванням
const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 хвилин
  cardsTTL: 5 * 60 * 1000, // 5 хвилин
  cardDetailTTL: 10 * 60 * 1000, // 10 хвилин
  favoritesTTL: 2 * 60 * 1000, // 2 хвилини
  userTTL: 60 * 60 * 1000, // 1 година
  commentsTTL: 5 * 60 * 1000, // 5 хвилин
  maxCacheSize: 10 * 1024 * 1024, // 10MB
};

// Версія кешу для глобальної інвалідації
const CACHE_VERSION = "1.0.0";

class HybridCache {
  private config: CacheConfig;
  private prefix: string;
  private storage: Storage;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.prefix = "wine-cache";
    this.storage =
      typeof window !== "undefined" ? localStorage : createMemoryStorage();
  }

  /**
   * Генерація ключа кешу з префіксом
   */
  private generateKey(type: string, identifier: string | object): string {
    const id =
      typeof identifier === "object" ? JSON.stringify(identifier) : identifier;
    return `${this.prefix}:${type}:${id}`;
  }

  /**
   * Перевірка чи дані ще актуальні
   */
  private isValid(entry: CacheEntry<unknown>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < entry.ttl;
  }

  /**
   * Перевірка чи дані "свіжі" (не застарілі)
   */
  private isFresh(entry: CacheEntry<unknown>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    // Свіжі дані - це дані, яким менше ніж TTL/2
    return age < entry.ttl / 2;
  }

  /**
   * Отримання даних з кешу
   */
  get<T>(key: string): CacheResult<T> {
    if (typeof window === "undefined") {
      return {
        data: null,
        fromCache: false,
        isStale: false,
        needsRevalidate: false,
      };
    }

    try {
      const raw = this.storage.getItem(key);
      if (!raw) {
        return {
          data: null,
          fromCache: false,
          isStale: false,
          needsRevalidate: false,
        };
      }

      const entry: CacheEntry<T> = JSON.parse(raw);

      // Перевірка версії
      if (entry.version !== CACHE_VERSION) {
        this.remove(key);
        return {
          data: null,
          fromCache: false,
          isStale: false,
          needsRevalidate: false,
        };
      }

      const now = Date.now();
      const age = now - entry.timestamp;
      const isStale = age >= entry.ttl;
      const isFresh = age < entry.ttl / 2;

      if (isStale) {
        // Дані застарілі, але ще можемо використати
        return {
          data: entry.data,
          fromCache: true,
          isStale: true,
          needsRevalidate: true,
        };
      }

      return {
        data: entry.data,
        fromCache: true,
        isStale: false,
        needsRevalidate: !isFresh,
      };
    } catch (error) {
      console.error("Cache get error:", error);
      return {
        data: null,
        fromCache: false,
        isStale: false,
        needsRevalidate: false,
      };
    }
  }

  /**
   * Збереження даних в кеш
   */
  set<T>(key: string, data: T, ttl?: number): void {
    if (typeof window === "undefined") return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        key,
        version: CACHE_VERSION,
      };

      // Перевірка розміру кешу перед збереженням
      this.checkCacheSize();

      const serialized = JSON.stringify(entry);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error("Cache set error:", error);
      // Якщо кеш повний, очищуємо найстаріші записи
      this.evictOldestEntries();
    }
  }

  /**
   * Видалення запису з кешу
   */
  remove(key: string): void {
    if (typeof window === "undefined") return;
    this.storage.removeItem(key);
  }

  /**
   * Очищення всього кешу
   */
  clear(): void {
    if (typeof window === "undefined") return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => this.storage.removeItem(key));
  }

  /**
   * Очищення кешу за типом
   */
  clearByType(type: string): void {
    if (typeof window === "undefined") return;

    const typePrefix = `${this.prefix}:${type}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(typePrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => this.storage.removeItem(key));
  }

  /**
   * Глобальна інвалідація (при зміні версії)
   */
  invalidate(): void {
    this.clear();
  }

  /**
   * Перевірка розміру кешу
   */
  private checkCacheSize(): void {
    let totalSize = 0;
    const entries: Array<{ key: string; size: number }> = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = this.storage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;
          entries.push({ key, size });
        }
      }
    }

    // Якщо кеш перевищує максимальний розмір, видаляємо найстаріші записи
    if (totalSize > this.config.maxCacheSize) {
      entries.sort((a, b) => {
        const entryA = JSON.parse(this.storage.getItem(a.key) || "{}");
        const entryB = JSON.parse(this.storage.getItem(b.key) || "{}");
        return entryA.timestamp - entryB.timestamp;
      });

      let removedSize = 0;
      const targetSize = this.config.maxCacheSize * 0.7; // Звільняємо до 70%

      for (const entry of entries) {
        if (totalSize - removedSize <= targetSize) break;
        this.storage.removeItem(entry.key);
        removedSize += entry.size;
      }
    }
  }

  /**
   * Видалення найстаріших записів
   */
  private evictOldestEntries(): void {
    this.checkCacheSize();
  }

  /**
   * Отримання TTL для конкретного типу даних
   */
  getTTLForType(type: keyof CacheConfig): number {
    return this.config[type] || this.config.defaultTTL;
  }

  /**
   * Статистика кешу (для debug)
   */
  getStats(): { size: number; entries: number; version: string } {
    if (typeof window === "undefined") {
      return { size: 0, entries: 0, version: CACHE_VERSION };
    }

    let size = 0;
    let entries = 0;

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = this.storage.getItem(key);
        if (value) {
          size += new Blob([value]).size;
          entries++;
        }
      }
    }

    return {
      size: Math.round(size / 1024), // в KB
      entries,
      version: CACHE_VERSION,
    };
  }
}

// Глобальний екземпляр кешу
export const hybridCache = new HybridCache();

// Фабрика для створення кешу з типом
export function createTypedCache<T>(type: string, ttl?: number) {
  return {
    get: (key: string | object) =>
      hybridCache.get<T>(hybridCache["generateKey"](type, key)),
    set: (key: string | object, data: T) => {
      const cacheKey = hybridCache["generateKey"](type, key);
      hybridCache.set(cacheKey, data, ttl);
    },
    remove: (key: string | object) => {
      const cacheKey = hybridCache["generateKey"](type, key);
      hybridCache.remove(cacheKey);
    },
    clear: () => hybridCache.clearByType(type),
  };
}

// Хук для React компонентів
export function createCacheHook<T>(type: string, defaultTTL?: number) {
  return function useCache() {
    return {
      get: (key: string | object) =>
        hybridCache.get<T>(hybridCache["generateKey"](type, key)),
      set: (key: string | object, data: T) => {
        const cacheKey = hybridCache["generateKey"](type, key);
        hybridCache.set(cacheKey, data, defaultTTL);
      },
      remove: (key: string | object) => {
        const cacheKey = hybridCache["generateKey"](type, key);
        hybridCache.remove(cacheKey);
      },
      clear: () => hybridCache.clearByType(type),
      invalidate: () => hybridCache.invalidate(),
      stats: () => hybridCache.getStats(),
    };
  };
}

// In-memory storage для SSR
function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] || null,
    clear: () => store.clear(),
  };
}

export default HybridCache;
