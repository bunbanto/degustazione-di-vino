export interface WineCard {
  _id: string;
  id?: number;
  name: string;
  type: string;
  color: string;
  winery?: string;
  country?: string;
  region?: string;
  anno?: number;
  year?: number;
  alcohol?: number;
  rating: number;
  ratingCount?: number;
  ratings?: number[];
  image: string;
  img?: string;
  description?: string;
  price: number | string;
  authorId?: number;
  createdAt?: string;
}

export interface User {
  id: number;
  username: string;
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
  minRating?: number;
  maxRating?: number;
  search?: string;
}
