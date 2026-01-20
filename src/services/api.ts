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
  // Отримати всі картки (сервер не підтримує фільтрацію, отримуємо всі)
  getAll: async (
    filters?: FilterParams,
    pagination?: PaginationParams,
  ): Promise<{ cards: WineCard[]; total: number }> => {
    // Сервер не підтримує фільтрацію - отримуємо всі картки
    // Використовуємо великий ліміт щоб отримати всі
    const response = await api.get(`/cards?page=1&limit=1000`);

    let cards = response.data.result || [];
    const total = response.data.total || 0;

    // Фільтрація на клієнті (оскільки сервер не підтримує)
    if (filters) {
      cards = cards.filter((card: WineCard) => {
        if (filters.type && card.type !== filters.type) return false;
        if (filters.color && card.color !== filters.color) return false;
        if (filters.minRating && card.rating < filters.minRating) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const nameMatch = card.name?.toLowerCase().includes(searchLower);
          const wineryMatch = card.winery?.toLowerCase().includes(searchLower);
          const countryMatch = card.country
            ?.toLowerCase()
            .includes(searchLower);
          const regionMatch = card.region?.toLowerCase().includes(searchLower);
          if (!nameMatch && !wineryMatch && !countryMatch && !regionMatch) {
            return false;
          }
        }
        return true;
      });
    }

    // Пагінація на клієнті
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      const end = start + pagination.limit;
      cards = cards.slice(start, end);
    }

    return {
      cards,
      total: cards.length,
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
  ): Promise<WineCard> => {
    const formData = new FormData();

    // Додаємо поля
    if (card.name !== undefined) formData.append("name", card.name);
    if (card.type !== undefined) formData.append("type", card.type);
    if (card.color !== undefined) formData.append("color", card.color);
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
    if (card.rating !== undefined)
      formData.append("rating", String(card.rating));

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
  ): Promise<{ averageRating: number }> => {
    const response = await api.post(`/cards/${id}/rate`, { rating });
    return response.data;
  },
};

export default api;
