/**
 * User type definitions
 */

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  theme: string | null;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Registration request data
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

/**
 * Login request data
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication response data
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

/**
 * Refresh token response data
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Profile update request data
 */
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  theme?: string;
  notificationsEnabled?: boolean;
}

/**
 * Password change request data
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}