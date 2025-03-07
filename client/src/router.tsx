/**
 * Router Configuration
 * 
 * This file configures the application's routing with React Router
 */

import React, { lazy } from 'react';
import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route, 
  Navigate 
} from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const PlantsPage = lazy(() => import('./pages/PlantsPage'));
const RecipesPage = lazy(() => import('./pages/RecipesPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Create router with routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute element={<DashboardPage />} />} />
      <Route path="/calendar" element={<ProtectedRoute element={<CalendarPage />} />} />
      <Route path="/weather" element={<ProtectedRoute element={<WeatherPage />} />} />
      <Route path="/plants" element={<ProtectedRoute element={<PlantsPage />} />} />
      <Route path="/recipes" element={<ProtectedRoute element={<RecipesPage />} />} />
      <Route path="/maintenance" element={<ProtectedRoute element={<MaintenancePage />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);

export default router; 