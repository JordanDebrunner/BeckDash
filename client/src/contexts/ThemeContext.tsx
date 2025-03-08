/**
 * Theme Context
 *
 * Manages theme functionality (light, dark, system) and persists user preferences
 * in localStorage. Also syncs with user settings when logged in.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { apiPut } from '../utils/apiUtils';
import { debounce } from 'lodash';

// Theme options
export type ThemeOption = 'light' | 'dark' | 'system';

// Theme context type
interface ThemeContextType {
  theme: ThemeOption;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: ThemeOption) => void;
  toggleTheme: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  currentTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Initialize theme from localStorage or default to system
  const savedTheme = localStorage.getItem('theme') as ThemeOption || 'system';
  
  // State for current theme preference
  const [themePreference, setThemePreference] = useState<ThemeOption>(savedTheme);
  
  // State for the actually applied theme (light or dark)
  const [appliedTheme, setAppliedTheme] = useState<'light' | 'dark'>('light');
  
  // Update theme in database (debounced to prevent too many requests)
  const debouncedUpdateThemeInDb = useCallback(
    debounce(async (theme: ThemeOption) => {
      if (!isAuthenticated) return;
      
      try {
        console.log(`Updating theme in database to: ${theme}`);
        await apiPut('/api/v1/auth/profile', { theme });
      } catch (error) {
        console.error('Failed to update theme in database:', error);
      }
    }, 1000),
    [isAuthenticated]
  );

  // Set theme function
  const setTheme = useCallback((newTheme: ThemeOption) => {
    console.log(`ThemeContext: Setting theme to ${newTheme}`);
    
    // Update state
    setThemePreference(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update in database if authenticated
    if (isAuthenticated) {
      console.log('ThemeContext: Updating theme in database');
      debouncedUpdateThemeInDb(newTheme);
    }
  }, [isAuthenticated, debouncedUpdateThemeInDb]);
  
  // Toggle between light, dark, and system themes
  const toggleTheme = () => {
    console.log('Toggling theme from:', themePreference);
    
    if (themePreference === 'light') {
      setTheme('dark');
    } else if (themePreference === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };
  
  // Apply theme based on user preference or system preference
  useEffect(() => {
    console.log('Theme changed to:', themePreference);
    
    const applyTheme = (themeName: 'light' | 'dark') => {
      // Add transition class for smooth theme change
      document.documentElement.classList.add('theme-transition');
      
      // Apply theme by toggling dark class on html element
      if (themeName === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update current theme state
      setAppliedTheme(themeName);
      
      // Remove transition class after changes are applied
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    };
    
    // Handle system theme preference
    if (themePreference === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply user selected theme directly
      applyTheme(themePreference === 'dark' ? 'dark' : 'light');
    }
  }, [themePreference]);
  
  // Sync theme with user preference when logged in
  useEffect(() => {
    if (isAuthenticated && user && user.theme) {
      const userTheme = user.theme as ThemeOption;
      
      // Only update if different from current theme to avoid loops
      if (userTheme !== themePreference) {
        console.log('Syncing theme from user profile:', userTheme);
        setTheme(userTheme);
        localStorage.setItem('theme', userTheme);
      }
    }
  }, [isAuthenticated, user, themePreference, setTheme]);
  
  return (
    <ThemeContext.Provider value={{ 
      theme: themePreference, 
      currentTheme: appliedTheme, 
      setTheme, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 