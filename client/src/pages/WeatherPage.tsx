/**
 * Weather Page
 *
 * Page for displaying weather information
 */

import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { formatTemperature, formatWindSpeed } from '../utils/formatters';

// Mock weather data (will be replaced with API calls)
const mockWeatherData = {
  current: {
    location: 'New York, NY',
    temperature: 72,
    feelsLike: 70,
    humidity: 65,
    windSpeed: 8,
    windDirection: 'NE',
    description: 'Sunny',
    icon: 'clear-day',
  },
  forecast: [
    {
      date: new Date(),
      temperature: { min: 65, max: 78 },
      humidity: 60,
      windSpeed: 10,
      description: 'Sunny',
      icon: 'clear-day',
      precipitation: 0,
    },
    {
      date: new Date(Date.now() + 86400000),
      temperature: { min: 63, max: 76 },
      humidity: 68,
      windSpeed: 12,
      description: 'Partly Cloudy',
      icon: 'partly-cloudy-day',
      precipitation: 10,
    },
    {
      date: new Date(Date.now() + 86400000 * 2),
      temperature: { min: 61, max: 72 },
      humidity: 75,
      windSpeed: 15,
      description: 'Rain',
      icon: 'rain',
      precipitation: 80,
    },
    {
      date: new Date(Date.now() + 86400000 * 3),
      temperature: { min: 64, max: 74 },
      humidity: 70,
      windSpeed: 8,
      description: 'Cloudy',
      icon: 'cloudy',
      precipitation: 20,
    },
    {
      date: new Date(Date.now() + 86400000 * 4),
      temperature: { min: 67, max: 77 },
      humidity: 65,
      windSpeed: 5,
      description: 'Sunny',
      icon: 'clear-day',
      precipitation: 0,
    },
  ],
};

/**
 * Weather icon component
 */
const WeatherIcon: React.FC<{ icon: string; size?: 'sm' | 'md' | 'lg' }> = ({
  icon,
  size = 'md',
}) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  // Map the icon string to the appropriate SVG
  const renderIcon = () => {
    switch (icon) {
      case 'clear-day':
        return (
          <svg className={`${sizeClass[size]} text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'partly-cloudy-day':
        return (
          <svg className={`${sizeClass[size]} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className={`${sizeClass[size]} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'rain':
        return (
          <svg className={`${sizeClass[size]} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className={`${sizeClass[size]} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
    }
  };

  return renderIcon();
};

/**
 * Weather page component
 */
const WeatherPage: React.FC = () => {
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState(mockWeatherData.current);
  const [forecast, setForecast] = useState(mockWeatherData.forecast);

  // Format the day name
  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Weather header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Weather</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Current conditions and forecast
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search location..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            <button className="p-2 bg-primary text-white rounded-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading and error states */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Current weather */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current conditions card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden lg:col-span-2">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {currentWeather.location}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatTemperature(currentWeather.temperature)}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Feels like {formatTemperature(currentWeather.feelsLike)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <WeatherIcon icon={currentWeather.icon} size="lg" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {currentWeather.description}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {currentWeather.humidity}%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatWindSpeed(currentWeather.windSpeed)} {currentWeather.windDirection}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather alerts or tips */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weather Alerts
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        No severe weather alerts at this time
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Today's Tip
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Perfect day for outdoor activities. Don't forget your sunscreen!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-day forecast */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {index === 0 ? 'Today' : formatDayName(day.date)}
                  </h4>
                  <div className="my-3 flex justify-center">
                    <WeatherIcon icon={day.icon} />
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {day.description}
                  </p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatTemperature(day.temperature.min)}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatTemperature(day.temperature.max)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <p>Precipitation: {day.precipitation}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation note for future development */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Development Note
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                This page currently displays mock data. In a production version, it would integrate with the OpenWeatherMap API as specified in the project requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WeatherPage;