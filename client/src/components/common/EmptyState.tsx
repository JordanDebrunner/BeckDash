/**
 * Empty State Component
 * 
 * Displays a message when no data is available
 */

import React, { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon, action }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
      {icon || (
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )}
      
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 