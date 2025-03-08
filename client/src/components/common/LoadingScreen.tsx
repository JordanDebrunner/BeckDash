/**
 * Loading Screen Component
 * 
 * Displays a loading spinner for use during component or page loading
 */
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 