/**
 * Router Configuration
 *
 * Defines the application routes and their corresponding components
 */
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const PlantsPage = lazy(() => import('./pages/PlantsPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RecipesPage = lazy(() => import('./pages/RecipesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Define routes with their components
const routes = [
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <RegisterPage />
      </Suspense>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <CalendarPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/weather',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <WeatherPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/plants',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <PlantsPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/maintenance',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <MaintenancePage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/recipes',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <RecipesPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <SettingsPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <div>Page not found</div>
  }
];

// Create the router with the routes
const router = createBrowserRouter(routes);

// Export the router directly
export default router; 