import axios from "axios";
import {
  WineCard,
  AuthResponse,
  FilterParams,
  PaginationParams,
  Comment,
  CommentsResponse,
  FavoritesResponse,
  ToggleFavoriteResponse,
} from "@/types";
import { hybridCache } from "@/lib/cache";
import {
  createOptimisticRatingUpdate,
  createOptimisticFavoriteUpdate,
  optimisticManager,
} from "@/lib/optimistic";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://wine-server-b5gr.onrender.com"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const pendingCardsRequests = new Map<
  string,
  Promise<{
    cards: WineCard[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>
>();

const DEFAULT_ERROR_MESSAGE = "Сталася помилка. Спробуйте ще раз.";

function getMessageFromPayload(payload: unknown): string | null {
  if (!payload) return null;

  if (typeof payload === "string") {
    return payload.trim() || null;
  }

  if (typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    message?: unknown;
    error?: unknown;
    errors?: unknown;
  };

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0] as { message?: unknown } | string;
    if (typeof firstError === "string" && firstError.trim()) {
      return firstError.trim();
    }
    if (
      firstError &&
      typeof firstError === "object" &&
      typeof firstError.message === "string" &&
      firstError.message.trim()
    ) {
      return firstError.message.trim();
    }
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (typeof window !== "undefined" && !navigator.onLine) {
    return "Немає зʼєднання з інтернетом. Перевірте мережу та спробуйте ще раз.";
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (!error.response) {
      return fallbackMessage;
    }

    if (status === 401)
      return "Сесія завершилась. Увійдіть у систему повторно.";
    if (status === 403) return "У вас немає доступу до цієї дії.";

    const serverMessage = getMessageFromPayload(error.response?.data);

    if (serverMessage) {
      return serverMessage;
    }

    if (status === 404) return "Запитувані дані не знайдено.";
    if (status === 422) return "Перевірте правильність заповнених даних.";
    if (status === 429) return "Забагато запитів. Спробуйте трохи пізніше.";
    if (status && status >= 500)
      return "Проблема на сервері. Спробуйте ще раз трохи пізніше.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function isApiNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

function handleAuthFailure() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    // ignore
  }

  // Best-effort clear zustand store without importing to avoid cycles
  try {
    const store = require("@/store/userStore");
    store.useUserStore.getState().setCurrentUser(null);
  } catch {
    // ignore
  }

  const pathname = window.location.pathname;
  const first = pathname.split("/").filter(Boolean)[0];
  const lang =
    first === "uk" || first === "en" || first === "it" ? first : "uk";

  window.location.assign(`/${lang}/login`);
}

// Додавання токена до запитів
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Глобальний обробник 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      handleAuthFailure();
    }
    return Promise.reject(error);
  },
);

// Кеш-ключі
const CACHE_KEYS = {
  cards: (filters?: FilterParams, pagination?: PaginationParams) =>
    hybridCache["generateKey"](
      "cards",
      JSON.stringify({ filters, pagination }),
    ),
  card: (id: string) => hybridCache["generateKey"]("card", id),
  favorites: () => hybridCache["generateKey"]("favorites", "all"),
  user: () => hybridCache["generateKey"]("user", "profile"),
};

function generateCacheKey(type: string, identifier: string | object): string {
  const id =
    typeof identifier === "object" ? JSON.stringify(identifier) : identifier;
  return `wine-cache:${type}:${id}`;
}

// API авторизації
export const authAPI = {
  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", { email, password });

    if (typeof window !== "undefined") {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },
};

export const cardsAPI = {
  getAll: async (
    filters?: FilterParams,
    pagination?: PaginationParams,
  ): Promise<{
    cards: WineCard[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> => {
    const cacheKey = generateCacheKey("cards", { filters, pagination });

    if (typeof window !== "undefined") {
      const cached = hybridCache.get<{
        cards: WineCard[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      }>(cacheKey);

      if (cached.data && cached.fromCache) {
        if (!cached.isStale && !cached.needsRevalidate) {
          return cached.data;
        }

        if (cached.isStale && cached.data) {
          fetchCardsInBackground(filters, pagination, cacheKey);
          return cached.data;
        }

        if (cached.needsRevalidate && cached.data) {
          fetchCardsInBackground(filters, pagination, cacheKey);
          return cached.data;
        }
      }
    }

    const pendingRequest = pendingCardsRequests.get(cacheKey);
    if (pendingRequest) return pendingRequest;

    const request = fetchCardsFromServer(filters, pagination).finally(() => {
      pendingCardsRequests.delete(cacheKey);
    });

    pendingCardsRequests.set(cacheKey, request);
    const result = await request;

    if (typeof window !== "undefined") {
      hybridCache.set(cacheKey, result, hybridCache.getTTLForType("cardsTTL"));
    }

    return result;
  },

  getById: async (id: string): Promise<WineCard> => {
    const cacheKey = generateCacheKey("card", id);

    if (typeof window !== "undefined") {
      const cached = hybridCache.get<WineCard>(cacheKey);

      if (cached.data && cached.fromCache && !cached.isStale) {
        return cached.data;
      }

      if (cached.isStale && cached.data) {
        api
          .get(`/cards/${id}`)
          .catch((error) => {
            if (
              (error.response?.status === 401 ||
                error.response?.status === 403) &&
              typeof window !== "undefined"
            ) {
              return publicApi.get(`/cards/${id}`);
            }
            throw error;
          })
          .then((response) => {
            hybridCache.set(
              cacheKey,
              response.data,
              hybridCache.getTTLForType("cardDetailTTL"),
            );
          })
          .catch(console.error);

        return cached.data;
      }
    }

    let response;
    try {
      response = await api.get(`/cards/${id}`);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        response = await publicApi.get(`/cards/${id}`);
      } else {
        throw error;
      }
    }

    if (typeof window !== "undefined") {
      hybridCache.set(
        cacheKey,
        response.data,
        hybridCache.getTTLForType("cardDetailTTL"),
      );
    }

    return response.data;
  },

  create: async (
    card: Partial<WineCard>,
    imageFile?: File,
  ): Promise<WineCard> => {
    const formData = new FormData();

    formData.append("name", card.name || "");
    formData.append("type", card.type || "wine");
    formData.append("color", card.color || "bianco");
    formData.append("frizzante", String(card.frizzante || false));
    formData.append("unfiltered", String(card.unfiltered || false));
    formData.append("winery", card.winery || "");
    formData.append("country", card.country || "");
    if (card.region) formData.append("region", card.region);
    if (card.anno !== undefined && card.anno !== null)
      formData.append("anno", String(card.anno));
    else if (card.year !== undefined && card.year !== null)
      formData.append("anno", String(card.year));
    formData.append("alcohol", String(card.alcohol || 12));
    formData.append("price", String(card.price || 0));
    formData.append("description", card.description || "");
    formData.append("rating", String(card.rating || 0));

    if (imageFile) formData.append("img", imageFile);

    const response = await api.post("/cards", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (typeof window !== "undefined") {
      hybridCache.clearByType("cards");
    }

    return response.data;
  },

  update: async (
    id: string,
    card: Partial<WineCard>,
    imageFile?: File,
    removeImageFlag?: boolean,
  ): Promise<WineCard> => {
    const formData = new FormData();

    if (card.name !== undefined) formData.append("name", card.name);
    if (card.type !== undefined) formData.append("type", card.type);
    if (card.color !== undefined) formData.append("color", card.color);
    if (card.frizzante !== undefined)
      formData.append("frizzante", String(card.frizzante));
    if (card.unfiltered !== undefined)
      formData.append("unfiltered", String(card.unfiltered));
    if (card.winery !== undefined) formData.append("winery", card.winery);
    if (card.country !== undefined) formData.append("country", card.country);
    if (card.region !== undefined) formData.append("region", card.region);
    if (card.anno !== undefined && card.anno !== null)
      formData.append("anno", String(card.anno));
    else if (card.year !== undefined && card.year !== null)
      formData.append("anno", String(card.year));
    if (card.alcohol !== undefined)
      formData.append("alcohol", String(card.alcohol));
    if (card.price !== undefined) formData.append("price", String(card.price));
    if (card.description !== undefined)
      formData.append("description", card.description);

    if (removeImageFlag)
      formData.append("removeImage", String(removeImageFlag));
    if (imageFile) formData.append("img", imageFile);

    const response = await api.put(`/cards/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (typeof window !== "undefined") {
      hybridCache.remove(generateCacheKey("card", id));
      hybridCache.clearByType("cards");
    }

    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/cards/${id}`);

    if (typeof window !== "undefined") {
      hybridCache.remove(generateCacheKey("card", id));
      hybridCache.clearByType("cards");
      hybridCache.clearByType("favorites");
    }

    return response.data;
  },

  rate: async (
    id: string,
    rating: number,
    currentCards?: WineCard[],
    onOptimisticUpdate?: (newCards: WineCard[]) => void,
  ): Promise<{ averageRating: number; ratingCount: number }> => {
    let username = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        username = user.username || user.name || "";
      }
    } catch (e) {
      console.error("Error getting user:", e);
    }

    const previousCards = currentCards ? [...currentCards] : null;

    if (currentCards && onOptimisticUpdate) {
      const optimistic = createOptimisticRatingUpdate(currentCards, id, rating);
      onOptimisticUpdate(optimistic.updatedCards);
    }

    try {
      const response = await api.patch(`/cards/${id}/rate`, {
        rating,
        username,
      });

      if (typeof window !== "undefined") {
        hybridCache.remove(generateCacheKey("card", id));
        hybridCache.clearByType("cards");
      }

      return response.data;
    } catch (error) {
      if (previousCards && onOptimisticUpdate) {
        onOptimisticUpdate(previousCards);
      }
      throw error;
    }
  },

  getComments: async (
    cardId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommentsResponse> => {
    const cacheKey = generateCacheKey("comments", { cardId, page, limit });

    if (typeof window !== "undefined") {
      const cached = hybridCache.get<CommentsResponse>(cacheKey);
      if (cached.data && cached.fromCache && !cached.isStale) {
        return cached.data;
      }
    }

    const response = await api.get(
      `/cards/${cardId}/comments?page=${page}&limit=${limit}`,
    );

    if (typeof window !== "undefined") {
      hybridCache.set(
        cacheKey,
        response.data,
        hybridCache.getTTLForType("commentsTTL"),
      );
    }

    return response.data;
  },

  addComment: async (cardId: string, text: string): Promise<WineCard> => {
    const response = await api.post(`/cards/${cardId}/comments`, { text });

    if (typeof window !== "undefined") {
      const commentsPrefix = `wine-cache:comments:`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(commentsPrefix) && key.includes(cardId)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      hybridCache.remove(generateCacheKey("card", cardId));
    }

    return response.data;
  },

  deleteComment: async (
    cardId: string,
    commentId: string,
  ): Promise<{ message: string; cardId: string }> => {
    const response = await api.delete(`/cards/${cardId}/comments/${commentId}`);

    if (typeof window !== "undefined") {
      const commentsPrefix = `wine-cache:comments:`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(commentsPrefix) && key.includes(cardId)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      hybridCache.remove(generateCacheKey("card", cardId));
    }

    return response.data;
  },

  getFavorites: async (filters?: FilterParams): Promise<FavoritesResponse> => {
    const cacheKey = generateCacheKey("favorites", { filters });

    if (typeof window !== "undefined") {
      const cached = hybridCache.get<FavoritesResponse>(cacheKey);
      if (cached.data && cached.fromCache && !cached.isStale) {
        return cached.data;
      }
    }

    const params = new URLSearchParams();
    if (filters?.sort) {
      params.set("sortField", filters.sort.field);
      params.set("sortDirection", filters.sort.direction);
    }

    const url = `/favorites${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get(url);

    if (typeof window !== "undefined") {
      hybridCache.set(
        cacheKey,
        response.data,
        hybridCache.getTTLForType("favoritesTTL"),
      );
    }

    return response.data;
  },

  toggleFavorite: async (
    cardId: string,
    currentFavorites?: WineCard[],
    onOptimisticUpdate?: (
      newFavorites: WineCard[],
      confirmedIsFavorite?: boolean,
    ) => void,
  ): Promise<{ isFavorite: boolean; cardId: string; message: string }> => {
    const previousFavorites = currentFavorites ? [...currentFavorites] : null;

    const expectedIsFavorite = currentFavorites
      ? !currentFavorites.find((c) => c._id === cardId)?.isFavorite
      : true;

    if (currentFavorites && onOptimisticUpdate) {
      const optimistic = createOptimisticFavoriteUpdate(
        currentFavorites,
        cardId,
      );
      onOptimisticUpdate(optimistic.updatedCards, expectedIsFavorite);
    }

    try {
      const response = await api.post<{
        isFavorite: boolean;
        cardId: string;
        message: string;
      }>(`/favorites/${cardId}`);
      const confirmedIsFavorite = response.data.isFavorite;

      if (typeof window !== "undefined") {
        hybridCache.clearByType("favorites");
      }

      if (currentFavorites && onOptimisticUpdate) {
        const updatedFavorites = currentFavorites.map((card) =>
          card._id === cardId
            ? { ...card, isFavorite: confirmedIsFavorite }
            : card,
        );
        onOptimisticUpdate(updatedFavorites, confirmedIsFavorite);
      }

      return response.data;
    } catch (error) {
      if (previousFavorites && onOptimisticUpdate) {
        onOptimisticUpdate(previousFavorites);
      }
      throw error;
    }
  },

  checkFavorite: async (cardId: string): Promise<{ isFavorite: boolean }> => {
    const response = await api.get(`/favorites/${cardId}`);
    return response.data;
  },
};

async function fetchCardsInBackground(
  filters?: FilterParams,
  pagination?: PaginationParams,
  cacheKey?: string,
) {
  try {
    const result = await fetchCardsFromServer(filters, pagination);
    if (typeof window !== "undefined" && cacheKey) {
      hybridCache.set(cacheKey, result, hybridCache.getTTLForType("cardsTTL"));
    }
  } catch (error) {
    console.error("Background fetch failed:", error);
  }
}

async function fetchCardsFromServer(
  filters?: FilterParams,
  pagination?: PaginationParams,
) {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.search) params.set("search", filters.search);
    if (filters.type) params.set("type", filters.type);
    if (filters.color) params.set("color", filters.color);
    if (filters.frizzante) params.set("frizzante", "true");
    if (filters.unfiltered) params.set("unfiltered", "true");
    if (filters.minRating)
      params.set("minRating", filters.minRating.toString());
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.winery) params.set("winery", filters.winery);
    if (filters.country) params.set("country", filters.country);
    if (filters.region) params.set("region", filters.region);
    if (filters.sort) {
      params.set("sortField", filters.sort.field);
      params.set("sortDirection", filters.sort.direction);
    }
  }

  if (pagination) {
    params.set("page", pagination.page.toString());
    params.set("limit", pagination.limit.toString());
  }

  const response = await api.get(`/cards?${params.toString()}`);

  return {
    cards: response.data.results || [],
    total: response.data.total || 0,
    page: response.data.page || 1,
    limit: response.data.limit || 10,
    totalPages: response.data.totalPages || 1,
    hasNextPage: response.data.hasNextPage || false,
    hasPrevPage: response.data.hasPrevPage || false,
  };
}

export const cacheUtils = {
  clearAll: () => {
    if (typeof window !== "undefined") {
      hybridCache.invalidate();
    }
  },
  clearCards: () => {
    if (typeof window !== "undefined") {
      hybridCache.clearByType("cards");
    }
  },
  clearFavorites: () => {
    if (typeof window !== "undefined") {
      hybridCache.clearByType("favorites");
    }
  },
  getStats: () => {
    if (typeof window !== "undefined") {
      return hybridCache.getStats();
    }
    return { size: 0, entries: 0, version: "N/A" };
  },
  rollbackAll: () => {
    optimisticManager.rollbackAll();
  },
};

export default api;
