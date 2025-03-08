/**
 * Forecast Details Component
 *
 * Displays detailed weather forecast information 
 */

import React, { useState } from 'react';
import { WeatherData } from '../../services/weather.service';
import { 
  formatTemperature, 
  formatWindSpeed, 
  formatTime, 
  formatPrecipitation,
  formatHumidity,
  formatPressure,
  formatVisibility,
  formatUVIndex,
  formatWindDirection
} from '../../utils/formatters';
import { FaChevronDown, FaChevronUp, FaThermometerHalf, FaWind, FaCloud, FaWater, FaCompass, FaTint, FaUmbrella, FaSun } from 'react-icons/fa';

/**
 * Props for the ForecastDetails component
 */
interface ForecastDetailsProps {
  /** Weather data to display */
  weatherData: WeatherData;
}

/**
 * Forecast Details Component
 */
const ForecastDetails: React.FC<ForecastDetailsProps> = ({ weatherData }) => {
  // Check if daily data exists
  const hasDaily = weatherData.daily && weatherData.daily.length > 0;
  const firstDay = hasDaily ? weatherData.daily[0] : null;
  
  // State for which accordion sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    temperature: true,
    precipitation: false,
    wind: false,
    sun: false,
    other: false
  });

  /**
   * Toggle a section's expanded state
   */
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
        Weather Details
      </h3>
      
      {/* Temperature Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          className="w-full p-4 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('temperature')}
        >
          <div className="flex items-center">
            <FaThermometerHalf className="w-5 h-5 mr-2 text-red-500" />
            <span className="font-medium text-gray-900 dark:text-white">Temperature</span>
          </div>
          {expandedSections.temperature ? (
            <FaChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.temperature && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTemperature(weatherData.current.temperature)}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Feels Like</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTemperature(weatherData.current.apparentTemperature)}
                </p>
              </div>
              
              {firstDay && (
                <>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's High</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTemperature(firstDay.temperatureMax)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's Low</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTemperature(firstDay.temperatureMin)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Precipitation Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          className="w-full p-4 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('precipitation')}
        >
          <div className="flex items-center">
            <FaUmbrella className="w-5 h-5 mr-2 text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">Precipitation</span>
          </div>
          {expandedSections.precipitation ? (
            <FaChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.precipitation && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPrecipitation(weatherData.current.precipitation)}
                </p>
              </div>
              
              {firstDay && (
                <>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's Total</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrecipitation(firstDay.precipitation)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatHumidity(weatherData.current.humidity)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Probability</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {Math.round(firstDay.precipitationProbability)}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Wind Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          className="w-full p-4 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('wind')}
        >
          <div className="flex items-center">
            <FaWind className="w-5 h-5 mr-2 text-teal-500" />
            <span className="font-medium text-gray-900 dark:text-white">Wind</span>
          </div>
          {expandedSections.wind ? (
            <FaChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.wind && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Speed</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatWindSpeed(weatherData.current.windSpeed)}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Direction</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatWindDirection(weatherData.current.windDirection)}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Gusts</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatWindSpeed(weatherData.current.windGusts)}
                </p>
              </div>
              
              {firstDay && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today's Max</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatWindSpeed(firstDay.windSpeed)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Sun/UV Section */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          className="w-full p-4 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('sun')}
        >
          <div className="flex items-center">
            <FaSun className="w-5 h-5 mr-2 text-yellow-500" />
            <span className="font-medium text-gray-900 dark:text-white">Sun & UV</span>
          </div>
          {expandedSections.sun ? (
            <FaChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.sun && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4">
              {firstDay && firstDay.sunrise && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sunrise</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(new Date(firstDay.sunrise))}
                  </p>
                </div>
              )}
              
              {firstDay && firstDay.sunset && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sunset</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(new Date(firstDay.sunset))}
                  </p>
                </div>
              )}
              
              {firstDay && firstDay.uvIndex !== undefined && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">UV Index</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {firstDay.uvIndex}
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Cloud Cover</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {weatherData.current.cloudCover}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Other Section */}
      <div>
        <button
          className="w-full p-4 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('other')}
        >
          <div className="flex items-center">
            <FaCompass className="w-5 h-5 mr-2 text-purple-500" />
            <span className="font-medium text-gray-900 dark:text-white">Other Details</span>
          </div>
          {expandedSections.other ? (
            <FaChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.other && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pressure</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPressure(weatherData.current.pressure)}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Visibility</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatVisibility(weatherData.current.visibility)}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Timezone</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {weatherData.timezone}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Data Updated</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(weatherData.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastDetails; 