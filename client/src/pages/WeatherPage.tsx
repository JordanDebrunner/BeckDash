/**
 * Weather Page
 *
 * Page for displaying weather information
 */

import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import Layout from '../components/common/Layout';
import weatherService, { WeatherData, WeatherLocation } from '../services/weather.service';
import CurrentWeather from '../components/weather/CurrentWeather';
import HourlyForecast from '../components/weather/HourlyForecast';
import DailyForecast from '../components/weather/DailyForecast';
import ForecastDetails from '../components/weather/ForecastDetails';
import WeatherAlert from '../components/weather/WeatherAlert';
import { FaSearch, FaLocationArrow } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * Error Boundary Component for Weather Components
 */
class WeatherErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Weather component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Something went wrong loading this component.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Default location (used only if geolocation fails)
const DEFAULT_LOCATION: WeatherLocation = {
  latitude: 39.8283,
  longitude: -98.5795,
  label: 'United States'  // Geographic center of the contiguous United States
};

/**
 * Weather page component
 */
const WeatherPage: React.FC = () => {
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<{ type: 'info' | 'warning' | 'severe'; message: string }[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [location, setLocation] = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false);

  // Try to get user's location on initial load
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        setIsUsingGeolocation(true);
        const userLocation = await weatherService.getUserLocation();
        setLocation(userLocation);
        console.log('Using user location:', userLocation);
      } catch (err) {
        console.error('Error getting initial location:', err);
        // Fall back to default location
        setIsUsingGeolocation(false);
      }
    };

    getInitialLocation();
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  // Fetch weather data from API
  const fetchWeatherData = async () => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching weather data for location:', location);
      // Fetch weather data for the current location
      const data = await weatherService.getWeatherData(location);
      console.log('Weather data received:', data);
      
      if (!data) {
        throw new Error('No weather data received');
      }
      
      if (!data.daily || data.daily.length === 0) {
        console.error('No daily forecast data received');
      } else {
        console.log(`Received ${data.daily.length} days of forecast data`);
      }
      
      if (!data.hourly || data.hourly.length === 0) {
        console.error('No hourly forecast data received');
      } else {
        console.log(`Received ${data.hourly.length} hours of forecast data`);
      }
      
      setWeatherData(data);
      
      // Generate alerts based on weather data
      if (data) {
        try {
          const weatherAlerts = weatherService.getWeatherAlerts(data);
          setAlerts(weatherAlerts);
        } catch (alertError) {
          console.error('Error generating weather alerts:', alertError);
          // Don't set an error state here, just log it
        }
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to load weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current location using browser geolocation
  const handleGetCurrentLocation = async () => {
    try {
      setIsUsingGeolocation(true);
      const userLocation = await weatherService.getUserLocation();
      setLocation(userLocation);
      toast.success('Using your current location');
    } catch (err) {
      setIsUsingGeolocation(false);
      toast.error(typeof err === 'string' ? err : 'Unable to get your location');
      console.error('Error getting location:', err);
    }
  };

  // Handle location search submit
  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    
    setIsUsingGeolocation(false);
    
    // For now, just set a mock location with the input as the label
    // In a real implementation, you would use a geocoding service to convert the location name to coordinates
    setLocation({
      ...location,
      label: locationInput
    });
    
    toast.success(`Location set to ${locationInput}`);
  };

  // Dismiss an alert
  const dismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  // Safely get weather recommendation
  const getWeatherRecommendation = () => {
    if (!weatherData) return "Loading weather data...";
    
    try {
      return weatherService.getWeatherRecommendation(weatherData);
    } catch (error) {
      console.error('Error getting weather recommendation:', error);
      return "Check the forecast to plan your day accordingly.";
    }
  };

  // Refresh weather data
  const handleRefresh = () => {
    fetchWeatherData();
    toast.success('Weather data refreshed');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Weather header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Weather</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Current conditions and forecast for {location.label}
              {isUsingGeolocation && ' (Your location)'}
            </p>
          </div>

          {/* Location search */}
          <form 
            className="flex items-center space-x-2"
            onSubmit={handleLocationSearch}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search location..."
                className="pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                <FaSearch className="text-gray-400" />
              </button>
            </div>
            <button
              type="button"
              className="p-2 bg-primary text-white rounded-md"
              onClick={handleGetCurrentLocation}
              title="Use current location"
            >
              <FaLocationArrow className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 bg-primary text-white rounded-md"
              onClick={handleRefresh}
              title="Refresh weather data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </form>
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
                <button
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                  onClick={fetchWeatherData}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weather data */}
        {!isLoading && !error && weatherData && (
          <div className="space-y-6">
            {/* Weather alerts */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <WeatherAlert
                    key={index}
                    type={alert.type}
                    message={alert.message}
                    onDismiss={() => dismissAlert(index)}
                  />
                ))}
              </div>
            )}

            {/* Current weather */}
            <WeatherErrorBoundary>
              <CurrentWeather weatherData={weatherData} />
            </WeatherErrorBoundary>

            {/* Daily forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WeatherErrorBoundary>
                  <DailyForecast 
                    dailyData={weatherData.daily || []} 
                    daysToShow={Math.min(14, weatherData.daily?.length || 0)}
                  />
                </WeatherErrorBoundary>
              </div>
              
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Weather recommendation */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Today's Tip
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {getWeatherRecommendation()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly forecast */}
            <WeatherErrorBoundary>
              <HourlyForecast 
                hourlyData={weatherData.hourly || []} 
                hoursToShow={Math.min(48, weatherData.hourly?.length || 0)}
              />
            </WeatherErrorBoundary>

            {/* Detailed weather info */}
            <WeatherErrorBoundary>
              <ForecastDetails weatherData={weatherData} />
            </WeatherErrorBoundary>
            
            {/* Debug information */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-8">
              <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
              <p>Daily forecast data: {weatherData.daily?.length || 0} days</p>
              <p>Hourly forecast data: {weatherData.hourly?.length || 0} hours</p>
              <p>Location: {weatherData.location.label} ({weatherData.location.latitude}, {weatherData.location.longitude})</p>
              <p>Timezone: {weatherData.timezone}</p>
              <p>Last updated: {new Date(weatherData.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WeatherPage;