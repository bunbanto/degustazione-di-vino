import axios from "axios";
import {
  WineCard,
  AuthResponse,
  FilterParams,
  PaginationParams,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// Cards APIs
export const cardsAPI = {
  // Отримати всі картки з серверною фільтрацією та пагінацією
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
    // Будуємо параметри запиту
    const params = new URLSearchParams();

    if (filters) {
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      if (filters.color) params.set("color", filters.color);
      if (filters.frizzante) params.set("frizzante", "true");
      if (filters.minRating)
        params.set("minRating", filters.minRating.toString());
      if (filters.winery) params.set("winery", filters.winery);
      if (filters.country) params.set("country", filters.country);
      if (filters.region) params.set("region", filters.region);
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
  },

  getById: async (id: string): Promise<WineCard> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Створити картку з завантаженням зображення
  create: async (
    card: Partial<WineCard>,
    imageFile?: File,
  ): Promise<WineCard> => {
    // Створюємо FormData для відправки файлу
    const formData = new FormData();

    // Додаємо обов'язкові поля (з правильними типами за замовчуванням для сервера)
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

    // Додаємо файл зображення
    if (imageFile) {
      formData.append("img", imageFile);
    }

    const response = await api.post("/cards", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Оновити картку з завантаженням зображення
  update: async (
    id: string,
    card: Partial<WineCard>,
    imageFile?: File,
    removeImageFlag?: boolean,
  ): Promise<WineCard> => {
    const formData = new FormData();

    // Додаємо поля
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
    // Rating should not be updated through card edit - it is updated only through the rate endpoint

    // Додаємо прапорець видалення зображення
    if (removeImageFlag) {
      formData.append("removeImage", String(removeImageFlag));
    }

    // Додаємо файл зображення
    if (imageFile) {
      formData.append("img", imageFile);
    }

    const response = await api.put(`/cards/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },

  rate: async (
    id: string,
    rating: number,
  ): Promise<{ averageRating: number; ratingCount: number }> => {
    // Get current user info from server
    let username = "";
    try {
      const user = await authAPI.getProfile();
      username = user.username || user.name || "";
    } catch (e) {
      console.error("Error getting user profile:", e);
    }

    const response = await api.patch(`/cards/${id}/rate`, { rating, username });
    return response.data;
  },
};

export default api;
