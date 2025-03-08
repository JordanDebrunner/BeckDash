/**
 * Shared API Types
 * 
 * Type definitions for API responses shared between client and server
 */

// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  timestamp?: string;
}

// API error interface
export interface ApiError {
  code?: string;
  field?: string;
  message: string;
  details?: any;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Search parameters
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
} 