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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://wine-server-b5gr.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Додавання токена до запитів
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Helper для генерації ключа кешу
function generateCacheKey(type: string, identifier: string | object): string {
  const id =
    typeof identifier === "object" ? JSON.stringify(identifier) : identifier;
  return `wine-cache:${type}:${id}`;
}

// Auth APIs
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

    // Зберігаємо в localStorage
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

// Cards APIs з кешуванням
export const cardsAPI = {
  // Отримати всі картки з кешуванням та stale-while-revalidate
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

    // Спочатку пробуємо з кешу
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
        // Якщо дані є в кеші і вони свіжі - повертаємо одразу
        if (!cached.isStale && !cached.needsRevalidate) {
          return cached.data;
        }

        // Якщо дані застарілі - повертаємо кеш і запускаємо фонове оновлення
        if (cached.isStale && cached.data) {
          // Фонове оновлення
          fetchCardsInBackground(filters, pagination, cacheKey);
          return cached.data;
        }

        // Якщо дані потрібно оновити - повертаємо кеш і оновлюємо
        if (cached.needsRevalidate && cached.data) {
          fetchCardsInBackground(filters, pagination, cacheKey);
          return cached.data;
        }
      }
    }

    // Немає кешу або помилка - робимо реальний запит
    const result = await fetchCardsFromServer(filters, pagination);

    // Зберігаємо в кеш
    if (typeof window !== "undefined") {
      hybridCache.set(cacheKey, result, hybridCache.getTTLForType("cardsTTL"));
    }

    return result;
  },

  // Отримати одну картку з кешуванням
  getById: async (id: string): Promise<WineCard> => {
    const cacheKey = generateCacheKey("card", id);

    // Спочатку пробуємо з кешу
    if (typeof window !== "undefined") {
      const cached = hybridCache.get<WineCard>(cacheKey);

      if (cached.data && cached.fromCache && !cached.isStale) {
        return cached.data;
      }

      // Якщо дані застарілі - повертаємо кеш і оновлюємо в фоні
      if (cached.isStale && cached.data) {
        api
          .get(`/cards/${id}`)
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

    // Робимо реальний запит
    const response = await api.get(`/cards/${id}`);

    // Зберігаємо в кеш
    if (typeof window !== "undefined") {
      hybridCache.set(
        cacheKey,
        response.data,
        hybridCache.getTTLForType("cardDetailTTL"),
      );
    }

    return response.data;
  },

  // Створити картку з очищенням кешу
  create: async (
    card: Partial<WineCard>,
    imageFile?: File,
  ): Promise<WineCard> => {
    const formData = new FormData();

    formData.append("name", card.name || "");
    formData.append("type", card.type || "secco");
    formData.append("color", card.color || "bianco");
    formData.append("frizzante", String(card.frizzante || false));
    formData.append("winery", card.winery || "");
    formData.append("country", card.country || "");
    formData.append("region", card.region || "");
    formData.append(
      "anno",
      String(card.anno || card.year || new Date().getFullYear()),
    );
    formData.append("alcohol", String(card.alcohol || 12));
    formData.append("price", String(card.price || 0));
    formData.append("description", card.description || "");
    formData.append("rating", String(card.rating || 0));

    if (imageFile) {
      formData.append("img", imageFile);
    }

    const response = await api.post("/cards", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Очищуємо кеш карток після створення
    if (typeof window !== "undefined") {
      hybridCache.clearByType("cards");
    }

    return response.data;
  },

  // Оновити картку з очищенням кешу
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
    if (card.winery !== undefined) formData.append("winery", card.winery);
    if (card.country !== undefined) formData.append("country", card.country);
    if (card.region !== undefined) formData.append("region", card.region);
    if (card.anno !== undefined) formData.append("anno", String(card.anno));
    else if (card.year !== undefined)
      formData.append("anno", String(card.year));
    if (card.alcohol !== undefined)
      formData.append("alcohol", String(card.alcohol));
    if (card.price !== undefined) formData.append("price", String(card.price));
    if (card.description !== undefined)
      formData.append("description", card.description);

    if (removeImageFlag) {
      formData.append("removeImage", String(removeImageFlag));
    }

    if (imageFile) {
      formData.append("img", imageFile);
    }

    const response = await api.put(`/cards/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Очищуємо кеш після оновлення
    if (typeof window !== "undefined") {
      hybridCache.remove(generateCacheKey("card", id));
      hybridCache.clearByType("cards");
    }

    return response.data;
  },

  // Видалити картку з очищенням кешу
  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/cards/${id}`);

    // Очищуємо кеш після видалення
    if (typeof window !== "undefined") {
      hybridCache.remove(generateCacheKey("card", id));
      hybridCache.clearByType("cards");
      hybridCache.clearByType("favorites");
    }

    return response.data;
  },

  // Оцінити картку з оптимістичним оновленням
  rate: async (
    id: string,
    rating: number,
    currentCards?: WineCard[],
    onOptimisticUpdate?: (newCards: WineCard[]) => void,
  ): Promise<{ averageRating: number; ratingCount: number }> => {
    // Отримуємо username з localStorage
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

    // Зберігаємо попередній стан для відкату
    const previousCards = currentCards ? [...currentCards] : null;

    // Оптимістичне оновлення
    if (currentCards && onOptimisticUpdate) {
      const optimistic = createOptimisticRatingUpdate(currentCards, id, rating);
      onOptimisticUpdate(optimistic.updatedCards);
    }

    try {
      const response = await api.patch(`/cards/${id}/rate`, {
        rating,
        username,
      });

      // Очищуємо кеш після успішного оцінювання
      if (typeof window !== "undefined") {
        // Очищуємо кеш цієї картки
        hybridCache.remove(generateCacheKey("card", id));
        // Очищуємо кеш списку карток
        hybridCache.clearByType("cards");
      }

      // Повертаємо дані про рейтинг з відповіді сервера
      return response.data;
    } catch (error) {
      // Відкат при помилці
      if (previousCards && onOptimisticUpdate) {
        onOptimisticUpdate(previousCards);
      }
      throw error;
    }
  },

  // Comments APIs
  getComments: async (
    cardId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommentsResponse> => {
    const cacheKey = generateCacheKey("comments", { cardId, page, limit });

    // Пробуємо з кешу
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

    // Очищуємо кеш коментарів
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
      // Очищуємо деталі картки
      hybridCache.remove(generateCacheKey("card", cardId));
    }

    return response.data;
  },

  deleteComment: async (
    cardId: string,
    commentId: string,
  ): Promise<{ message: string; cardId: string }> => {
    const response = await api.delete(`/cards/${cardId}/comments/${commentId}`);

    // Очищуємо кеш
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

  // Favorites APIs з кешуванням та оптимістичним оновленням
  getFavorites: async (filters?: FilterParams): Promise<FavoritesResponse> => {
    const cacheKey = generateCacheKey("favorites", { filters });

    // Пробуємо з кешу
    if (typeof window !== "undefined") {
      const cached = hybridCache.get<FavoritesResponse>(cacheKey);
      if (cached.data && cached.fromCache && !cached.isStale) {
        return cached.data;
      }
    }

    // Будуємо параметри запиту
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
    // Зберігаємо попередній стан
    const previousFavorites = currentFavorites ? [...currentFavorites] : null;

    // Визначаємо очікуваний новий стан для оптимістичного оновлення
    const expectedIsFavorite = currentFavorites
      ? !currentFavorites.find((c) => c._id === cardId)?.isFavorite
      : true;

    // Оптимістичне оновлення
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

      // Оновлюємо кеш
      if (typeof window !== "undefined") {
        hybridCache.clearByType("favorites");
      }

      // Повторно викликаємо callback з підтвердженим станом від сервера
      // щоб компонент міг оновити UI правильним станом
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
      // Відкат при помилці
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

// Допоміжна функція для фонової вибірки карток
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

// Функція вибірки карток з сервера
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

// Утиліти для кешу
export const cacheUtils = {
  // Очистити весь кеш
  clearAll: () => {
    if (typeof window !== "undefined") {
      hybridCache.invalidate();
    }
  },

  // Очистити кеш карток
  clearCards: () => {
    if (typeof window !== "undefined") {
      hybridCache.clearByType("cards");
    }
  },

  // Очистити кеш обраного
  clearFavorites: () => {
    if (typeof window !== "undefined") {
      hybridCache.clearByType("favorites");
    }
  },

  // Отримати статистику кешу
  getStats: () => {
    if (typeof window !== "undefined") {
      return hybridCache.getStats();
    }
    return { size: 0, entries: 0, version: "N/A" };
  },

  // Відкатити всі оптимістичні оновлення
  rollbackAll: () => {
    optimisticManager.rollbackAll();
  },
};

export default api;
