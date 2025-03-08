/**
 * Settings Page
 *
 * User settings page with theme selection and animated background toggle
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import useAuth from '../hooks/useAuth';
import { ThemeOption } from '../contexts/ThemeContext';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

// Declare the global functions
declare global {
  interface Window {
    toggleAnimatedBackground: () => boolean;
    getAnimatedBackgroundState: () => boolean;
    setAnimatedBackgroundState: (state: boolean) => boolean;
  }
}

/**
 * Settings page component
 */
const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for settings
  const [animatedBackground, setAnimatedBackground] = useState<boolean>(() => {
    // Initialize from body class
    return !document.body.classList.contains('no-animation');
  });
  
  // State for current theme
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    // Initialize from localStorage
    return localStorage.getItem('theme') as ThemeOption || 'system';
  });
  
  // State for tracking changes
  const [hasChanges, setHasChanges] = useState(false);
  
  // Ultra-simple theme switcher functions that use window functions
  const switchToLight = () => {
    window.localStorage.setItem('theme', 'light');
    window.document.documentElement.classList.remove('dark');
    window.document.documentElement.classList.add('light-theme');
    setCurrentTheme('light');
    setHasChanges(true);
    toast.success('Light theme applied');
  };
  
  const switchToDark = () => {
    window.localStorage.setItem('theme', 'dark');
    window.document.documentElement.classList.add('dark');
    window.document.documentElement.classList.remove('light-theme');
    setCurrentTheme('dark');
    setHasChanges(true);
    toast.success('Dark theme applied');
  };
  
  const switchToSystem = () => {
    window.localStorage.setItem('theme', 'system');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      window.document.documentElement.classList.add('dark');
      window.document.documentElement.classList.remove('light-theme');
    } else {
      window.document.documentElement.classList.remove('dark');
      window.document.documentElement.classList.add('light-theme');
    }
    setCurrentTheme('system');
    setHasChanges(true);
    toast.success('System theme applied');
  };
  
  // Simple toggle for animated background
  const toggleBackground = () => {
    // Direct DOM manipulation
    const isCurrentlyEnabled = !document.body.classList.contains('no-animation');
    const newState = !isCurrentlyEnabled;
    
    if (newState) {
      // Enable animation
      document.body.classList.remove('no-animation');
      localStorage.setItem('animatedBackground', 'true');
    } else {
      // Disable animation
      document.body.classList.add('no-animation');
      localStorage.setItem('animatedBackground', 'false');
    }
    
    // Update state
    setAnimatedBackground(newState);
    setHasChanges(true);
    toast.success(newState ? 'Animated background enabled' : 'Animated background disabled');
  };
  
  // Save settings
  const saveSettings = async () => {
    try {
      await authService.updateProfile({ theme: currentTheme });
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };
  
  // Handle save and return to dashboard
  const handleSave = async () => {
    await saveSettings();
    navigate('/');
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your application preferences and appearance.
          </p>
        </div>
        
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Theme Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Light Theme Button */}
            <button
              type="button"
              onClick={switchToLight}
              className={`p-4 rounded-lg flex flex-col items-center justify-center ${
                currentTheme === 'light'
                  ? 'bg-blue-100 border-2 border-blue-500 dark:bg-blue-900'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="bg-white rounded-full p-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Light Theme</h3>
            </button>
            
            {/* Dark Theme Button */}
            <button
              type="button"
              onClick={switchToDark}
              className={`p-4 rounded-lg flex flex-col items-center justify-center ${
                currentTheme === 'dark'
                  ? 'bg-purple-100 border-2 border-purple-500 dark:bg-purple-900'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="bg-gray-800 rounded-full p-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Theme</h3>
            </button>
            
            {/* System Theme Button */}
            <button
              type="button"
              onClick={switchToSystem}
              className={`p-4 rounded-lg flex flex-col items-center justify-center ${
                currentTheme === 'system'
                  ? 'bg-green-100 border-2 border-green-500 dark:bg-green-900'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="bg-gradient-to-r from-blue-100 to-gray-800 rounded-full p-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Theme</h3>
            </button>
          </div>
        </div>
        
        {/* Animated Background Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Animated Background
          </h2>
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleBackground}
              className={`relative inline-flex items-center ${animatedBackground ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"} h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="sr-only">Toggle animated background</span>
              <span
                className={`${
                  animatedBackground ? "translate-x-6" : "translate-x-1"
                } inline-block w-4 h-4 transform bg-white dark:bg-white rounded-full transition-transform duration-200 ease-in-out`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Enable animated background
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            When enabled, a subtle animated background will be displayed behind the content.
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save & Return to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage; 