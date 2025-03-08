/**
 * Loading Spinner Component
 * 
 * Displays a loading spinner for async operations
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };

  const borderColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
  const sizeClass = sizeClasses[size];

  return (
    <div className={`animate-spin rounded-full ${sizeClass} border-t-2 border-b-2 ${borderColor}`}></div>
  );
};

export default LoadingSpinner; 