/**
 * Daily Forecast Component
 * 
 * Displays daily weather forecast for multiple days
 */

import React, { useState } from 'react';
import { DailyWeather } from '../../services/weather.service';
import WeatherIcon from './WeatherIcon';
import { formatTemperature, formatDayName, formatMonthDay } from '../../utils/formatters';

/**
 * Props for the DailyForecast component
 */
interface DailyForecastProps {
  /** Array of daily forecast data */
  dailyData: DailyWeather[];
  /** Number of days to show */
  daysToShow?: number;
  /** When a day is clicked */
  onDayClick?: (day: DailyWeather) => void;
}

/**
 * Daily Forecast Component
 */
const DailyForecast: React.FC<DailyForecastProps> = ({ 
  dailyData = [], 
  daysToShow = 14,
  onDayClick
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const daysPerPage = 7; // Show 7 days per page
  
  // Check if we have data
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {daysToShow}-Day Forecast
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No forecast data available
        </p>
      </div>
    );
  }
  
  // Limit data to specified number of days
  const limitedData = dailyData.slice(0, Math.min(daysToShow, dailyData.length));
  
  // Calculate total pages
  const totalPages = Math.ceil(limitedData.length / daysPerPage);
  
  // Get current page data
  const startIndex = currentPage * daysPerPage;
  const endIndex = Math.min(startIndex + daysPerPage, limitedData.length);
  const currentPageData = limitedData.slice(startIndex, endIndex);
  
  /**
   * Format day name from date string
   */
  const formatDay = (date: string, index: number): string => {
    if (index === 0 && currentPage === 0) return 'Today';
    if (index === 1 && currentPage === 0) return 'Tomorrow';
    return formatDayName(date);
  };
  
  /**
   * Get weather icon based on weather code
   */
  const getWeatherIcon = (weatherCode: number): string => {
    if (weatherCode === 0) return 'clear-day';
    if (weatherCode <= 3) return 'partly-cloudy-day';
    if (weatherCode <= 48) return 'fog';
    if (weatherCode <= 67) return 'rain';
    if (weatherCode <= 77) return 'snow';
    if (weatherCode <= 82) return 'rain';
    if (weatherCode <= 86) return 'snow';
    return 'thunderstorm';
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
          {daysToShow}-Day Forecast
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {currentPageData.map((day, index) => {
          if (!day) return null;
          
          const weatherIcon = getWeatherIcon(day.weatherCode);
          const actualIndex = startIndex + index;
          
          // Handle click on day
          const handleClick = () => {
            if (onDayClick) {
              onDayClick(day);
            }
          };
          
          return (
            <div 
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={handleClick}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {formatDay(day.date, actualIndex)}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatMonthDay(day.date)}
              </div>
              
              <div className="my-3 flex justify-center">
                <WeatherIcon icon={weatherIcon} />
              </div>
              
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {day.weatherDescription}
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {formatTemperature(day.temperatureMin)}
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTemperature(day.temperatureMax)}
                </span>
              </div>
              
              {day.precipitationProbability > 0 && (
                <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                  {Math.round(day.precipitationProbability)}% chance
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast; 