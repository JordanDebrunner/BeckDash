/**
 * Authentication Context
 *
 * Provides authentication state and methods to the entire application
 */

import React, { createContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, ProfileUpdateRequest, PasswordChangeRequest } from '../types/User';
import authService from '../services/auth.service';
import { ApiError } from '../services/api.service';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Auth methods
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  changePassword: (data: PasswordChangeRequest) => Promise<void>;
  clearError: () => void;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  clearError: () => {},
});

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to wrap the application
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State variables
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is authenticated
  const isAuthenticated = Boolean(user);

  // Clear any error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load user profile on mount and when authentication state changes
  const loadUserProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
      // If we get a 401 error, clear the token
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem('accessToken');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login method
  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      clearError();
      const response = await authService.login(data);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register method
  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      clearError();
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during registration');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on the server, clear local state
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile method
  const updateProfile = async (data: ProfileUpdateRequest) => {
    try {
      setIsLoading(true);
      clearError();
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during profile update');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password method
  const changePassword = async (data: PasswordChangeRequest) => {
    try {
      setIsLoading(true);
      clearError();
      await authService.changePassword(data);
    } catch (error) {
      console.error('Password change failed:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during password change');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Listen for authentication events (logout)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};