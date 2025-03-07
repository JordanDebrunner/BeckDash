/**
 * Main App Component
 *
 * This is the root component of the application that sets up routing and providers
 */

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './router';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import authService from './services/auth.service';

function App() {
  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No token found, user is not authenticated');
          return;
        }
        
        // Validate the token by fetching the user profile
        const user = await authService.getProfile();
        console.log('User authenticated:', user);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" />
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;