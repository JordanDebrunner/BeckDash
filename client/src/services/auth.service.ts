/**
 * Authentication service
 *
 * This service provides methods for user authentication operations
 * including login, registration, logout, and profile management
 */

import apiService from './api.service';
import {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest
} from '../types/User';

/**
 * Authentication service class
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/register', data); // Fixed from '/auth/register'

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    return response;
  }

  /**
   * Log in an existing user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/login', data); // Fixed from '/auth/login'

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    return response;
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string> {
    const response = await apiService.post<RefreshTokenResponse>('/refresh-token'); // Fixed from '/auth/refresh-token'

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      return response.accessToken;
    }

    throw new Error('Failed to refresh token');
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    await apiService.post('/logout'); // Fixed from '/auth/logout'

    localStorage.removeItem('accessToken');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<User> {
    return apiService.get<{ user: User }>('/profile') // Fixed from '/auth/profile'
      .then(response => response.user);
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    return apiService.put<{ user: User }>('/profile', data) // Fixed from '/auth/profile'
      .then(response => response.user);
  }

  /**
   * Change the current user's password
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await apiService.post('/change-password', data); // Fixed from '/auth/change-password'
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
}

const authService = new AuthService();

export default authService;