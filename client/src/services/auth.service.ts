/**
 * Authentication service
 *
 * This service provides methods for user authentication operations
 * including login, registration, logout, and profile management
 */

import { apiGet, apiPost, apiPut } from '../utils/apiUtils';
import {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest
} from '../types/User';
import axios from 'axios';

// API base URL
const API_BASE_URL = '/api/v1';

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

/**
 * Authentication service class
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiPost<AuthResponse>(`${API_BASE_URL}/auth/register`, data);

      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Log in an existing user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('AuthService: Attempting to login with data:', data);
    
    try {
      // For development, just return a successful response with dummy data
      const dummyResponse: AuthResponse = {
        user: {
          id: 'dev-user-id',
          email: data.email,
          firstName: 'Dev',
          lastName: 'User',
          profileImageUrl: null,
          theme: 'light',
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        accessToken: 'dummy-access-token'
      };
      
      console.log('AuthService: Login response:', dummyResponse);

      // Store the token in localStorage
      localStorage.setItem('accessToken', dummyResponse.accessToken);

      return dummyResponse;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await apiPost<RefreshTokenResponse>(`${API_BASE_URL}/auth/refresh-token`, {});

      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        return response.accessToken;
      }

      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      await apiPost(`${API_BASE_URL}/auth/logout`, {});
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on the server, clear local state
      localStorage.removeItem('accessToken');
      throw error;
    }
  }

  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiGet<{ user: User }>(`${API_BASE_URL}/auth/profile`);
      return response.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    console.log('AuthService: Updating profile with data:', data);
    
    // Special handling for theme-only updates
    if (data.theme && Object.keys(data).length === 1) {
      console.log('AuthService: Theme-only update detected:', data.theme);
      
      try {
        const response = await apiPut<{ user: User }>(`${API_BASE_URL}/auth/profile`, {
          theme: data.theme
        });
        console.log('AuthService: Theme update response:', response);
        return response.user;
      } catch (error) {
        console.error('AuthService: Theme update failed:', error);
        throw error;
      }
    }
    
    // Regular profile update
    try {
      const response = await apiPut<{ user: User }>(`${API_BASE_URL}/auth/profile`, data);
      console.log('AuthService: Profile update response:', response);
      return response.user;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change the current user's password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      await apiPost(`${API_BASE_URL}/auth/change-password`, data);
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get the current access token
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get the current user from local storage
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Set user information
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

const authService = new AuthService();

export default authService;