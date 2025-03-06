/**
 * Protected Route Component
 *
 * A wrapper component that protects routes from unauthenticated access
 */

import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Props interface
interface ProtectedRouteProps {
  element: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that restricts access to authenticated users only
 * and handles React.Suspense for lazy-loaded components
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Wrap the element in Suspense to handle lazy-loaded components
  return (
    <Suspense fallback={<LoadingFallback />}>
      {element}
    </Suspense>
  );
};

export default ProtectedRoute;