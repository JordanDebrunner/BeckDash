/**
 * API Utilities
 * 
 * Standardized utilities for API request and response handling
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../../../shared/types/api.types';

/**
 * Process API response to extract data
 * Handles different response structures consistently
 */
export function processResponse<T>(response: any): T;
export function processResponse<T, K extends keyof T>(response: any, dataKey: K): T[K];
export function processResponse<T, K extends keyof T>(response: any, dataKey?: K): T | T[K] {
  // Check if response has the standard structure with data property
  if (response?.data?.data && dataKey && dataKey in response.data.data) {
    return response.data.data[dataKey];
  }
  
  // Check if response has data property with the key
  if (response?.data && dataKey && dataKey in response.data) {
    return response.data[dataKey];
  }
  
  // If no dataKey is provided, return the entire data object
  if (response?.data?.data && !dataKey) {
    return response.data.data as T;
  }
  
  // If response has data property but no nested data
  if (response?.data && !dataKey) {
    return response.data as T;
  }
  
  // If we can't find the expected structure, log and throw error
  console.error('Unexpected API response structure:', response);
  throw new Error('Unexpected API response structure');
};

/**
 * Process API error consistently
 */
export const processError = (error: unknown): { message: string; status: number; errors?: any[] } => {
  console.error('API Error:', error);
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Unknown error';
    const errors = error.response?.data?.errors;
    
    return { message, status, errors };
  }
  
  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }
  
  return { message: 'Unknown error occurred', status: 500 };
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * Make a direct API request with consistent error handling
 */
export const makeDirectRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any
): Promise<T> => {
  try {
    const headers = getAuthHeaders();
    let response;
    
    switch (method) {
      case 'get':
        response = await axios.get<T>(url, { headers });
        break;
      case 'post':
        response = await axios.post<T>(url, data, { headers });
        break;
      case 'put':
        response = await axios.put<T>(url, data, { headers });
        break;
      case 'delete':
        response = await axios.delete<T>(url, { headers });
        break;
    }
    
    // Use the appropriate overload based on whether we have a data key
    return processResponse<T>(response);
  } catch (error) {
    throw processError(error);
  }
};

/**
 * Handles API responses and extracts data or throws formatted errors
 * @param response The fetch response object
 * @returns The data from the API response
 * @throws Error with formatted message if the API request fails
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  // Check if the response is ok before trying to parse JSON
  if (!response.ok) {
    // For non-200 responses, try to get error details if possible
    try {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      // Try to parse the error text as JSON
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch (parseError) {
        // If we can't parse as JSON, use the raw text if it exists
        if (errorText && errorText.trim().length > 0) {
          errorMessage += ` - ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    } catch (textError) {
      // If we can't even get the text, throw a generic error
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }
  
  // Try to parse the JSON for successful responses
  try {
    const jsonResponse = await response.json() as ApiResponse<T>;
    
    // Check if the response indicates an error despite the 200 status
    if (!jsonResponse.success) {
      const errorMessage = formatErrorMessage(jsonResponse);
      throw new Error(errorMessage);
    }
    
    // Return the data
    return jsonResponse.data as T;
  } catch (jsonError) {
    // Handle JSON parsing errors
    console.error('Failed to parse API response as JSON:', jsonError);
    throw new Error(`Failed to parse API response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
  }
}

/**
 * Formats error messages from API responses
 * @param response The API response containing errors
 * @returns A formatted error message
 */
function formatErrorMessage(response: ApiResponse<any>): string {
  // If there's a message in the response, use it
  if (response.message) {
    return response.message;
  }
  
  // If there are specific errors, format them
  if (response.errors && response.errors.length > 0) {
    const errorDetails = response.errors.map((error: { field?: string; message: string }) => {
      if (error.field) {
        return `${error.field}: ${error.message}`;
      }
      return error.message;
    }).join('; ');
    
    return `API Error: ${errorDetails}`;
  }
  
  // Default error message
  return 'An unknown error occurred';
}

/**
 * Creates a query string from an object of parameters
 * @param params Object containing query parameters
 * @returns Formatted query string starting with '?'
 */
export function createQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(`${key}[]`, String(item)));
      } else if (typeof value === 'object') {
        queryParams.append(key, JSON.stringify(value));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Wrapper for fetch API that handles common options and error cases
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The fetch response
 */
export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Get the auth token from localStorage
  const token = localStorage.getItem('accessToken');
  
  // Set up headers with auth token if available
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Always include Content-Type as JSON unless it's a FormData request
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Merge our headers with the provided options
  const fetchOptions: RequestInit = {
    ...options,
    headers
  };
  
  // Ensure the URL has the correct base
  const apiUrl = url.startsWith('http') 
    ? url 
    : `http://localhost:3000${url.startsWith('/') ? url : `/${url}`}`;
  
  try {
    // Attempt the fetch
    console.log(`Fetching from: ${apiUrl}`);
    const response = await fetch(apiUrl, fetchOptions);
    
    // Handle 401 Unauthorized by redirecting to login
    if (response.status === 401) {
      // Clear the token
      localStorage.removeItem('accessToken');
      
      // Redirect to login page
      window.location.href = '/login';
      
      // Throw an error to stop further processing
      throw new Error('Authentication required. Please log in.');
    }
    
    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    
    throw new Error('An unknown network error occurred');
  }
}

/**
 * Generic API request function that combines fetchWithAuth and handleApiResponse
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The processed API response data
 */
export async function apiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // Ensure the URL has the correct base
    const apiUrl = url.startsWith('http') 
      ? url 
      : `http://localhost:3000${url.startsWith('/') ? url : `/${url}`}`;
    
    // Get the auth token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    // Convert fetch options to axios options
    const method = options.method || 'GET';
    const data = options.body ? JSON.parse(options.body as string) : undefined;
    
    console.log(`Making ${method} request to ${apiUrl}`, { headers, data });
    
    // Make the request with axios
    const response = await axios({
      method,
      url: apiUrl,
      headers,
      data,
      // Don't use withCredentials since we're sending the token in the Authorization header
      withCredentials: false
    });
    
    console.log(`Response from ${apiUrl}:`, response.data);
    
    // Check if the response was successful
    if (!response.data.success) {
      throw new Error(response.data.message || 'API request failed');
    }
    
    // Return the data
    return response.data.data as T;
  } catch (error) {
    console.error('API request error:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle axios errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Handle 401 Unauthorized by redirecting to login
        if (error.response.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          throw new Error('Authentication required. Please log in.');
        }
        
        // Try to extract error message from response
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `API Error: ${error.response.status} ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
    
    // Handle other errors
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred');
  }
}

/**
 * Shorthand for GET requests
 * @param url The URL to fetch
 * @param params Query parameters
 * @returns The processed API response data
 */
export async function apiGet<T>(
  url: string, 
  params: Record<string, any> = {}
): Promise<T> {
  const queryString = createQueryString(params);
  return apiRequest<T>(`${url}${queryString}`, { method: 'GET' });
}

/**
 * Shorthand for POST requests
 * @param url The URL to fetch
 * @param data The data to send
 * @returns The processed API response data
 */
export async function apiPost<T>(
  url: string, 
  data: any
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Shorthand for PUT requests
 * @param url The URL to fetch
 * @param data The data to send
 * @returns The processed API response data
 */
export async function apiPut<T>(
  url: string, 
  data: any
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Shorthand for PATCH requests
 * @param url The URL to fetch
 * @param data The data to send
 * @returns The processed API response data
 */
export async function apiPatch<T>(
  url: string, 
  data: any
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * Shorthand for DELETE requests
 * @param url The URL to fetch
 * @returns The processed API response data
 */
export async function apiDelete<T>(
  url: string
): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' });
} 