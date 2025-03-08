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
    console.log('Initializing API service with baseURL:', '/api/v1');
    
    // Create Axios instance with relative baseURL
    this.api = axios.create({
      baseURL: '/api/v1', // Updated to match server routes
      headers: {'Content-Type': 'application/json' },
      withCredentials: true, // Needed for cookies
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');

        // Log the request for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
          headers: config.headers,
          data: config.data,
          params: config.params
        });

        // If token exists, add it to request headers
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('No access token found for request:', config.url);
        }

        return config;
      },
      (error) => {
        console.error('API Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          data: response.data
        });
        return response;
      },
      async (error: AxiosError) => {
        console.error('API Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          data: error.response?.data,
          message: error.message
        });

        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized errors
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          // Don't attempt to refresh token for auth endpoints
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/register')
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
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${newToken}` };
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
      console.log('Attempting to refresh token');
      const response = await axios.post<ApiResponse<{ accessToken: string }>>(
        '/api/v1/auth/refresh-token',
        {},
        { withCredentials: true } // Important for cookies
      );

      // Save the new token to localStorage
      const accessToken = response.data.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      }

      throw new ApiError('No access token received in refresh response', 401);
    } catch (error) {
      // Clear local storage and redirect to login
      localStorage.removeItem('accessToken');

      // Dispatch a logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));

      if (error instanceof Error) {
        throw new ApiError(
          `Failed to refresh token: ${error.message}`, 
          error instanceof ApiError ? error.status : 401
        );
      } else {
        throw new ApiError('Failed to refresh token: Unknown error', 401);
      }
    }
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log(`Making GET request to ${url}`, {
        headers: config?.headers,
        params: config?.params
      });
      
      // Get authentication headers
      const authHeaders = this.getAuthHeaders();
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...config?.headers
      };
      
      // Try a direct request to the backend
      try {
        const directResponse = await axios.get<ApiResponse<T>>(
          `http://localhost:3000${this.api.defaults.baseURL}${url}`, 
          {
            ...config,
            headers
          }
        );
        
        console.log(`Direct GET response from ${url}:`, directResponse.data);
        return this.processResponse<T>(directResponse);
      } catch (directError) {
        console.error(`Direct GET request to ${url} failed:`, directError);
        // Continue with the regular request if direct request fails
      }
      
      const response = await this.api.get<ApiResponse<T>>(url, {
        ...config,
        headers
      });
      console.log(`GET response from ${url}:`, response.data);
      return this.processResponse<T>(response);
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw this.processError(error);
    }
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log(`Making POST request to ${url} with data:`, data instanceof FormData ? 'FormData object' : data);
      
      // Get authentication headers
      const authHeaders = this.getAuthHeaders();
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...config?.headers
      };
      
      // Special handling for file uploads
      if (url.includes('/files/profile-image')) {
        console.log('Special handling for profile image upload');
        
        // Ensure we have the correct token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found for file upload');
        }
        
        // Create a direct request to the backend with proper headers
        try {
          const directUrl = `http://localhost:3000/api/v1/files/profile-image`;
          console.log(`Sending file upload to ${directUrl}`);
          
          const directResponse = await axios.post<ApiResponse<T>>(
            directUrl, 
            data,
            {
              ...config,
              headers: {
                ...config?.headers,
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          console.log(`Direct file upload response:`, directResponse.data);
          return this.processResponse<T>(directResponse);
        } catch (directError) {
          console.error(`Direct file upload failed:`, directError);
          // Fall back to regular API request
        }
      }
      
      // Try a direct request to the backend for all endpoints
      try {
        const directResponse = await axios.post<ApiResponse<T>>(
          `http://localhost:3000${this.api.defaults.baseURL}${url}`, 
          data,
          {
            ...config,
            headers
          }
        );
        
        console.log(`Direct POST response from ${url}:`, directResponse.data);
        return this.processResponse<T>(directResponse);
      } catch (directError) {
        console.error(`Direct POST request to ${url} failed:`, directError);
        // Continue with the regular request if direct request fails
      }
      
      const response = await this.api.post<ApiResponse<T>>(url, data, {
        ...config,
        headers
      });
      console.log(`POST response from ${url}:`, response.data);
      return this.processResponse<T>(response);
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      throw this.processError(error);
    }
  }

  /**
   * Make a PUT request to the API
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log(`Making PUT request to ${url} with data:`, data);
      
      // Special handling for profile updates
      if (url === '/auth/profile') {
        // Use direct URL to backend for profile updates
        console.log('Using direct backend URL for profile update');
        const directUrl = 'http://localhost:3000/api/v1/auth/profile';
        
        try {
          const response = await axios.put<ApiResponse<T>>(directUrl, data, {
            ...config,
            headers: {
              ...config?.headers,
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          console.log(`Direct PUT response from ${directUrl}:`, response.data);
          return this.processResponse<T>(response);
        } catch (error) {
          console.error(`Direct PUT request to ${directUrl} failed:`, error);
          // Fall back to regular API request if direct request fails
          console.log('Falling back to regular API request');
        }
      }
      
      // Special handling for theme updates
      if (data && data.theme && Object.keys(data).length === 1) {
        console.log(`Special handling for theme update to: ${data.theme}`);
      }
      
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      console.log(`PUT response from ${url}:`, response.data);
      return this.processResponse<T>(response);
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
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
    // Check if response has the expected structure
    if (!response.data) {
      throw new ApiError('Invalid API response format', response.status);
    }

    // Check if the response indicates an error
    if (response.data.success === false) {
      throw new ApiError(
        response.data.message || 'API request failed',
        response.status,
        response.data.errors
      );
    }

    // Return the data property if it exists, otherwise return the entire response data
    return (response.data.data !== undefined ? response.data.data : response.data) as T;
  }

  /**
   * Process API errors
   */
  private processError(error: unknown): ApiError {
    console.error('Processing API error:', error);
    
    // If it's already an ApiError, return it
    if (error instanceof ApiError) {
      return error;
    }
    
    // If it's an Axios error with a response
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message || 'API request failed';
      const errors = error.response.data?.errors;
      
      // Handle 401 Unauthorized errors
      if (status === 401) {
        // Clear tokens on authentication failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      return new ApiError(message, status, errors);
    }
    
    // For other types of errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new ApiError(message, 500);
  }

  /**
   * Get authentication headers for requests
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Create a singleton instance of the API service
const apiService = new ApiService();

export default apiService;