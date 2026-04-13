// src/types/index.ts
// Tipos globales compartidos entre frontend y backend

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: PaginationMeta;
  details?: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Parámetros de paginación estándar
export interface PaginationParams {
  page: number;
  limit: number;
}
