/**
 * Main App Component
 *
 * This is the root component of the application that sets up routing and providers
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const PlantsPage = lazy(() => import('./pages/PlantsPage'));
const RecipesPage = lazy(() => import('./pages/RecipesPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

// Auth protection for routes
import ProtectedRoute from './components/common/ProtectedRoute';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
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

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;