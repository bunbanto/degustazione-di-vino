/**
 * Custom hooks для гібридного кешування та оптимістичних оновлень
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { hybridCache, CacheConfig, CacheResult } from "@/lib/cache";
import { optimisticManager } from "@/lib/optimistic";

// Хук для використання гібридного кешу
export function useHybridCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
): {
  data: T | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  isStale: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStale, setIsStale] = useState(false);
  const fetchingRef = useRef(false);

  // Declare fetchDataInBackground first to avoid hoisting issues
  const fetchDataInBackground = useCallback(async () => {
    try {
      const result = await fetcher();
      hybridCache.set(key, result, ttl);
    } catch (err) {
      console.error("Background fetch failed:", err);
    }
  }, [key, fetcher, ttl]);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (fetchingRef.current && !showLoading) return;

      // Спочатку пробуємо з кешу
      if (typeof window !== "undefined") {
        const cached = hybridCache.get<T>(key);
        if (cached.data && cached.fromCache && !cached.isStale) {
          setData(cached.data);
          setLoading(false);
          setIsStale(false);
          return;
        }

        if (cached.isStale && cached.data) {
          setData(cached.data);
          setIsStale(true);
          // Фонове оновлення
          fetchDataInBackground();
        }

        if (cached.needsRevalidate && cached.data) {
          setData(cached.data);
          setIsStale(true);
          fetchDataInBackground();
        }
      }

      if (showLoading) {
        setLoading(true);
      }
      setError("");

      try {
        const result = await fetcher();
        setData(result);
        setIsStale(false);
        hybridCache.set(key, result, ttl);
      } catch (err: any) {
        setError(err.message || "Помилка завантаження");
        // При помилці пробуємо кеш
        if (!data) {
          const cached = hybridCache.get<T>(key);
          if (cached.data) {
            setData(cached.data);
            setIsStale(true);
          }
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [key, fetcher, ttl, data, fetchDataInBackground],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: () => fetchData(), isStale };
}

// Хук для оптимістичних оновлень списку
export function useOptimisticList<T extends { _id: string }>(
  initialItems: T[],
  updateFn: (id: string, ...args: any[]) => Promise<void>,
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const previousItemsRef = useRef<T[] | null>(null);

  // Додавання елемента оптимістично
  const addOptimistic = useCallback(
    (newItem: T) => {
      if (!previousItemsRef.current) {
        previousItemsRef.current = [...items];
      }
      setItems((prev) => [newItem, ...prev]);
    },
    [items],
  );

  // Видалення елемента оптимістично
  const removeOptimistic = useCallback(
    (id: string) => {
      if (!previousItemsRef.current) {
        previousItemsRef.current = [...items];
      }
      setItems((prev) => prev.filter((item) => item._id !== id));
    },
    [items],
  );

  // Оновлення елемента оптимістично
  const updateOptimistic = useCallback(
    (id: string, updates: Partial<T>) => {
      if (!previousItemsRef.current) {
        previousItemsRef.current = [...items];
      }
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, ...updates } : item)),
      );
    },
    [items],
  );

  // Виконання мутації з відкатом при помилці
  const mutate = useCallback(
    async (
      id: string,
      mutationFn: () => Promise<void>,
      options?: { onSuccess?: () => void },
    ) => {
      setLoadingIds((prev) => new Set(prev).add(id));

      try {
        await mutationFn();
        previousItemsRef.current = null;
        options?.onSuccess?.();
      } catch (error) {
        // Відкат
        if (previousItemsRef.current) {
          setItems(previousItemsRef.current);
          previousItemsRef.current = null;
        }
        throw error;
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [],
  );

  // Відкат всіх змін
  const rollback = useCallback(() => {
    if (previousItemsRef.current) {
      setItems(previousItemsRef.current);
      previousItemsRef.current = null;
    }
  }, []);

  // Скидання до початкового стану
  const reset = useCallback((newItems: T[]) => {
    setItems(newItems);
    previousItemsRef.current = null;
  }, []);

  return {
    items,
    setItems,
    loadingIds,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
    mutate,
    rollback,
    reset,
    isUpdating: loadingIds.size > 0,
  };
}

// Хук для офлайн статусу
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
}

// Хук для статистики кешу
export function useCacheStats() {
  const [stats, setStats] = useState({ size: 0, entries: 0, version: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateStats = () => {
      setStats(hybridCache.getStats());
    };

    updateStats();

    // Оновлюємо при змінах localStorage
    const handleStorage = () => updateStats();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const clearCache = useCallback(() => {
    hybridCache.invalidate();
    setStats({ size: 0, entries: 0, version: hybridCache.getStats().version });
  }, []);

  return {
    stats,
    clearCache,
    refreshStats: () => setStats(hybridCache.getStats()),
  };
}

// Хук для debounced фільтрів з кешуванням
export function useDebouncedFilters<T>(initialFilters: T, delay: number = 500) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<T>(initialFilters);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filters, delay]);

  return { filters, setFilters, debouncedFilters };
}

export default {
  useHybridCache,
  useOptimisticList,
  useOffline,
  useCacheStats,
  useDebouncedFilters,
};
