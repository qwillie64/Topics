/**
 * Shared TypeScript types for the Topics project API.
 * Place at: C:\Users\MA302\Topics\api\types.ts
 */

export type UUID = string;

export interface EventTag {
  id: number;
  name: string;
}

export interface EventCategory {
  id: number;
  name: string;
}

export interface EventItem {
  id: UUID;
  title: string;
  description?: string;
  location?: string;
  start: string;  // ISO 8601
  end: string;    // ISO 8601
  categories?: EventCategory[] | number[];
  tags?: EventTag[] | number[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorPayload {
  message: string;
  code?: string | number;
  details?: unknown;
}

export interface LoginRequest {
  account: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface AccountProfile {
  id: UUID;
  username: string;
  email?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}
