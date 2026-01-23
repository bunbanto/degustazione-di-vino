/**
 * Lib exports - Головний експорт для lib модулів
 */

// Cache модуль
export { hybridCache, createTypedCache, createCacheHook } from "./cache";
export type { CacheConfig, CacheEntry, CacheResult } from "./cache";

// Optimistic updates модуль
export {
  optimisticManager,
  createOptimisticState,
  createOptimisticRatingUpdate,
  createOptimisticFavoriteUpdate,
  createOptimisticDelete,
  createOptimisticAdd,
} from "./optimistic";
export type { RollbackFn } from "./optimistic";

// Hooks модуль
export {
  useHybridCache,
  useOptimisticList,
  useOffline,
  useCacheStats,
  useDebouncedFilters,
} from "./hooks";
