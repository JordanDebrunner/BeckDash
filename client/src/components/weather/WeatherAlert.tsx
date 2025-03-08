/**
 * Weather Alert Component
 *
 * Displays different types of weather alerts with appropriate styling
 */

import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Props for the WeatherAlert component
 */
export interface WeatherAlertProps {
  /** The type/severity of the alert */
  type: 'info' | 'warning' | 'severe';
  /** Alert message content */
  message: string;
  /** Optional callback when alert is dismissed */
  onDismiss?: () => void;
}

/**
 * Weather Alert Component
 */
const WeatherAlert: React.FC<WeatherAlertProps> = ({ 
  type, 
  message, 
  onDismiss 
}) => {
  // Determine alert colors based on type
  const alertStyles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-400'
    },
    severe: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-400'
    }
  };

  /**
   * Get the appropriate icon based on alert type
   */
  const getAlertIcon = () => {
    switch (type) {
      case 'severe':
      case 'warning':
        return <FaExclamationTriangle className={`h-5 w-5 ${alertStyles[type].icon}`} />;
      case 'info':
      default:
        return <FaInfoCircle className={`h-5 w-5 ${alertStyles[type].icon}`} />;
    }
  };

  /**
   * Get the alert title based on type
   */
  const getAlertTitle = () => {
    switch (type) {
      case 'severe':
        return 'Severe Weather Alert';
      case 'warning':
        return 'Weather Warning';
      case 'info':
      default:
        return 'Weather Information';
    }
  };

  return (
    <div className={`rounded-md p-4 border ${alertStyles[type].bg} ${alertStyles[type].border}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getAlertIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${alertStyles[type].text}`}>
            {getAlertTitle()}
          </h3>
          <div className={`mt-2 text-sm ${alertStyles[type].text}`}>
            <p>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${alertStyles[type].text} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${alertStyles[type].border}`}
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherAlert; 