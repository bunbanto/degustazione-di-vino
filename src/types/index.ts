export interface Comment {
  _id: string;
  userId: { _id: string; name?: string } | string;
  username?: string;
  text: string;
  createdAt: string;
}

export interface WineCard {
  _id: string;
  id?: number;
  name: string;
  type: string;
  color: string;
  frizzante?: boolean;
  winery?: string;
  country?: string;
  region?: string;
  anno?: number;
  year?: number;
  alcohol?: number;
  rating: number; // Average rating from server
  ratingCount?: number;
  ratings?: Array<{
    userId: { _id: string; name?: string } | string;
    value: number;
    username?: string;
  }>; // Array of individual ratings
  comments?: Comment[]; // Array of comments
  image: string;
  img?: string;
  description?: string;
  price: number | string;
  authorId?: number;
  owner?: { _id: string; email?: string; name?: string };
  createdAt?: string;
  isFavorite?: boolean; // Whether the current user has marked this card as favorite
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface User {
  id?: string | number;
  _id?: string;
  username?: string;
  name?: string;
  email: string;
  role: string;
  createdAt?: string;
  cardCount?: number;
  favoritesCount?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FavoritesResponse {
  results: WineCard[];
  total: number;
}

export interface ToggleFavoriteResponse {
  card: WineCard;
  isFavorite: boolean;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type SortField = "name" | "price" | "rating";
export type SortDirection = "asc" | "desc";

export interface SortParams {
  field: SortField;
  direction: SortDirection;
}

export interface FilterParams {
  type?: string;
  color?: string;
  frizzante?: boolean;
  minRating?: number;
  maxRating?: number;
  search?: string;
  winery?: string;
  country?: string;
  region?: string;
  sort?: SortParams;
}
