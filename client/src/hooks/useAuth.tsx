/**
 * Authentication Hook
 * 
 * Custom hook for managing authentication state and operations
 */
import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import authService from '../services/auth.service';

// Auth context type
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Register data type
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        // Don't set error for initial auth check to avoid showing error message
        // on first load when user is not logged in
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login method
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register method
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook
 * 
 * Custom hook to access the auth context
 */
export const useAuth = () => useContext(AuthContext); 