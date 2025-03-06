/**
 * Custom hook for accessing authentication context
 *
 * This hook provides a convenient way to access the authentication
 * context throughout the application.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook that provides access to authentication state and methods
 *
 * @returns Authentication context containing user data and auth methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;