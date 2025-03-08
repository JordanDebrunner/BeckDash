/**
 * Hourly Forecast Component
 *
 * Displays hourly weather forecast in a scrollable layout
 */

import React, { useState } from 'react';
import WeatherIcon from './WeatherIcon';
import { HourlyWeather } from '../../services/weather.service';
import { formatTemperature, formatTime } from '../../utils/formatters';

/**
 * Props for the HourlyForecast component
 */
interface HourlyForecastProps {
  /** Array of hourly forecast data */
  hourlyData: HourlyWeather[];
  /** Number of hours to display (default: 48) */
  hoursToShow?: number;
}

/**
 * Hourly Forecast Component
 */
const HourlyForecast: React.FC<HourlyForecastProps> = ({ 
  hourlyData = [], 
  hoursToShow = 48 
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const hoursPerPage = 24; // Show 24 hours per page
  
  // Check if we have data
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Hourly Forecast
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hourly forecast data available
        </p>
      </div>
    );
  }
  
  // Limit data to specified number of hours
  const limitedData = hourlyData.slice(0, Math.min(hoursToShow, hourlyData.length));
  
  // Calculate total pages
  const totalPages = Math.ceil(limitedData.length / hoursPerPage);
  
  // Get current page data
  const startIndex = currentPage * hoursPerPage;
  const endIndex = Math.min(startIndex + hoursPerPage, limitedData.length);
  const currentPageData = limitedData.slice(startIndex, endIndex);
  
  // Get current hour for highlighting the current time
  const currentTime = new Date();

  /**
   * Format hour from date string
   */
  const formatHour = (date: string): string => {
    return formatTime(new Date(date));
  };

  /**
   * Check if the given hour is the current hour
   */
  const isCurrentHour = (date: string): boolean => {
    const hourDate = new Date(date);
    return hourDate.getHours() === currentTime.getHours() && 
           hourDate.getDate() === currentTime.getDate();
  };
  
  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Hourly Forecast
        </h3>
        
        {totalPages > 1 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-3 py-1 rounded ${
                currentPage === 0 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              Prev
            </button>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages - 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex space-x-4 min-w-full">
          {currentPageData.map((hour, index) => {
            if (!hour) return null;
            
            const isNow = isCurrentHour(hour.time) && currentPage === 0;
            const actualIndex = startIndex + index;
            
            let weatherIcon = 'cloudy';
            if (hour.weatherCode === 0) {
              weatherIcon = hour.isDay ? 'clear-day' : 'clear-night';
            } else if (hour.weatherCode <= 3) {
              weatherIcon = hour.isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
            } else if (hour.weatherCode <= 48) {
              weatherIcon = 'fog';
            } else if (hour.weatherCode <= 67) {
              weatherIcon = 'rain';
            } else if (hour.weatherCode <= 77) {
              weatherIcon = 'snow';
            } else if (hour.weatherCode <= 82) {
              weatherIcon = 'rain';
            } else if (hour.weatherCode <= 86) {
              weatherIcon = 'snow';
            } else {
              weatherIcon = 'thunderstorm';
            }
            
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center p-3 rounded-lg ${
                  isNow ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {isNow ? 'Now' : formatHour(hour.time)}
                </div>
                
                <div className="my-2">
                  <WeatherIcon icon={weatherIcon} size="sm" />
                </div>
                
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTemperature(hour.temperature)}
                </div>
                
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {hour.precipitationProbability > 0 && (
                    <span>{Math.round(hour.precipitationProbability)}% </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast; 