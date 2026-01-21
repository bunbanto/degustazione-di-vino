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
  image: string;
  img?: string;
  description?: string;
  price: number | string;
  authorId?: number;
  createdAt?: string;
}

export interface User {
  id?: string | number;
  _id?: string;
  username?: string;
  name?: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  type?: string;
  color?: string;
  frizzante?: boolean;
  minRating?: number;
  maxRating?: number;
  search?: string;
}
