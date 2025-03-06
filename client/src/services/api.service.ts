/**
 * API service for making HTTP requests
 *
 * This service provides methods for interacting with the backend API
 * It handles authentication, request formatting, and response parsing
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: {
    field?: string;
    message: string;
    code?: string;
  }[];
}

// API error type
export class ApiError extends Error {
  status: number;
  errors?: any[];

  constructor(message: string, status: number, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Create a class for the API service
class ApiService {
  private api: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    // Create Axios instance with relative baseURL
    this.api = axios.create({
      baseURL: '/api/v1/auth', // Relative path, proxied by Vite
      headers: {'Content-Type': 'application/json' },
      withCredentials: true, // Needed for cookies
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');

        // If token exists, add it to request headers
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized errors
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // Prevent multiple refresh attempts
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshToken();
            }

            // Wait for the token refresh to complete
            const newToken = await this.refreshPromise;

            // Reset refresh promise
            this.refreshPromise = null;

            // Update the authorization header with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${token}` };
            }

            // Retry the original request with the new token
            return this.api(originalRequest);
          } catch (refreshError) {
            // If token refresh fails, clear local storage and redirect to login
            this.refreshPromise = null;
            localStorage.removeItem('accessToken');

            // Dispatch a logout event
            window.dispatchEvent(new CustomEvent('auth:logout'));

            return Promise.reject(refreshError);
          }
        }

        // Handle other API errors
        if (error.response?.data) {
          const { message, errors } = error.response.data as ApiResponse<unknown>;
          return Promise.reject(new ApiError(message, error.response.status, errors));
        }

        // Handle network errors
        return Promise.reject(new ApiError(
          error.message || 'Network error',
          error.response?.status || 0
        ));
      }
    );
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshToken(): Promise<string> {
    try {
      const response = await this.api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');

      // Save the new token to localStorage
      const accessToken = response.data.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      }

      throw new Error('No access token received');
    } catch (error) {
      // Clear local storage and redirect to login
      localStorage.removeItem('accessToken');

      // Dispatch a logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));

      throw new ApiError('Failed to refresh token', 401);
    }
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Make a PUT request to the API
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Process the API response
   */
  private processResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    // If the response is successful but has no data, return an empty object
    if (response.data.success && response.data.data === undefined) {
      return {} as T;
    }

    // If the response has data, return it
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }

    // If the response is not successful, throw an error
    throw new ApiError(
      response.data.message,
      response.status,
      response.data.errors
    );
  }

  /**
   * Process API errors
   */
  private processError(error: unknown): ApiError {
    // If it's already an ApiError, return it
    if (error instanceof ApiError) {
      return error;
    }

    // If it's an AxiosError, extract the relevant information
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiResponse<unknown>;
      return new ApiError(
        response?.message || error.message,
        error.response?.status || 500,
        response?.errors
      );
    }

    // For other errors, return a generic error
    return new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

// Create a singleton instance of the API service
const apiService = new ApiService();

export default apiService;