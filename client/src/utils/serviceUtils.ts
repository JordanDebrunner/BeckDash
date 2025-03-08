/**
 * Service Utilities
 * 
 * Higher-order functions and utilities for service methods
 */

import { ApiResponse } from '../../../shared/types/api.types';
import { makeDirectRequest, apiGet, apiPost, apiPut, apiDelete } from './apiUtils';

/**
 * Higher-order function to handle API requests with direct and fallback approaches
 * 
 * @param directMethod - Function to make direct API request
 * @param fallbackMethod - Function to use as fallback if direct request fails
 * @param errorHandler - Function to handle errors
 * @returns Result of the API request
 */
export const withDirectFallback = async <T>(
  directMethod: () => Promise<T>,
  fallbackMethod: () => Promise<T>,
  errorHandler: (error: unknown) => T | Promise<T>
): Promise<T> => {
  try {
    // Try direct API request first
    try {
      return await directMethod();
    } catch (directError) {
      console.error('Direct API request failed:', directError);
      console.log('Falling back to regular API service');
    }
    
    // Fall back to regular API service
    return await fallbackMethod();
  } catch (error) {
    return await errorHandler(error);
  }
};

/**
 * Create a service method with standard error handling and logging
 * 
 * @param serviceFn - The service function to wrap
 * @param context - Context for logging
 * @param defaultValue - Default value to return on error
 * @returns Wrapped service function with error handling
 */
export const withErrorHandling = <T, Args extends any[]>(
  serviceFn: (...args: Args) => Promise<T>,
  context: string,
  defaultValue?: T
) => {
  return async (...args: Args): Promise<T> => {
    try {
      return await serviceFn(...args);
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  };
};

/**
 * Create a service method that tries direct API request first, then falls back to regular API service
 * 
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param responseKey - Key to extract from response
 * @param defaultValue - Default value to return on error
 * @returns Service method with direct and fallback approaches
 */
export const createServiceMethod = <T, K extends keyof T, P = any>(
  endpoint: string,
  method: 'get' | 'post' | 'put' | 'delete',
  responseKey?: K,
  defaultValue?: T[K]
) => {
  return async (id?: string, payload?: P): Promise<T[K] | undefined> => {
    const url = id ? `${endpoint}/${id}` : endpoint;
    const apiBaseUrl = '/api/v1';
    const fullUrl = `${apiBaseUrl}${url}`;
    
    try {
      let response: T;
      
      if (method === 'get') {
        response = await apiGet<T>(fullUrl);
      } else if (method === 'post') {
        response = await apiPost<T>(fullUrl, payload);
      } else if (method === 'put') {
        response = await apiPut<T>(fullUrl, payload);
      } else {
        response = await apiDelete<T>(fullUrl);
      }
      
      return responseKey ? response[responseKey] : response as any;
    } catch (error) {
      console.error(`Error in ${method.toUpperCase()} ${url}:`, error);
      return defaultValue as T[K];
    }
  };
}; 