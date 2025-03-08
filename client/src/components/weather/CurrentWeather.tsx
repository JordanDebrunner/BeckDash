/**
 * Current Weather Component
 *
 * Displays current weather conditions
 */

import React from 'react';
import { WeatherData } from '../../services/weather.service';
import WeatherIcon from './WeatherIcon';
import { 
  formatTemperature, 
  formatWindSpeed, 
  formatHumidity,
  formatWindDirection,
  formatTime,
  formatFullDate
} from '../../utils/formatters';

/**
 * Props for the CurrentWeather component
 */
interface CurrentWeatherProps {
  /** Weather data to display */
  weatherData: WeatherData;
}

/**
 * Current Weather Component
 */
const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weatherData }) => {
  // Extract needed data
  const { current, location, daily } = weatherData;
  
  // Check if daily data exists
  const hasDaily = daily && daily.length > 0;
  const firstDay = hasDaily ? daily[0] : null;
  
  /**
   * Get weather icon based on weather code and day/night
   */
  const getWeatherIcon = (weatherCode: number, isDay: boolean): string => {
    if (weatherCode === 0) return isDay ? 'clear-day' : 'clear-night';
    if (weatherCode <= 3) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    if (weatherCode <= 48) return 'fog';
    if (weatherCode <= 67) return 'rain';
    if (weatherCode <= 77) return 'snow';
    if (weatherCode <= 82) return 'rain';
    if (weatherCode <= 86) return 'snow';
    return 'thunderstorm';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        {/* Location and date */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {location.label}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {formatFullDate(current.time)}
            </p>
          </div>
          
          {/* Current temperature */}
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatTemperature(current.temperature)}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Feels like {formatTemperature(current.apparentTemperature)}
            </p>
          </div>
        </div>
        
        {/* Weather condition and details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <WeatherIcon 
              icon={getWeatherIcon(current.weatherCode, current.isDay)} 
              size="lg" 
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {current.weatherDescription}
              </h3>
              {firstDay && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  High: {formatTemperature(firstDay.temperatureMax)} &bull; 
                  Low: {formatTemperature(firstDay.temperatureMin)}
                </p>
              )}
            </div>
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatHumidity(current.humidity)}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatWindSpeed(current.windSpeed)} {formatWindDirection(current.windDirection)}
              </p>
            </div>
            
            {firstDay && firstDay.sunrise && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sunrise</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(new Date(firstDay.sunrise))}
                </p>
              </div>
            )}
            
            {firstDay && firstDay.sunset && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sunset</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(new Date(firstDay.sunset))}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Data attribution */}
        <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
          Weather data provided by <a href="https://open-meteo.com/" className="underline" target="_blank" rel="noopener noreferrer">Open-Meteo</a>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather; 