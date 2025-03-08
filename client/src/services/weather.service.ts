/**
 * Weather Service
 *
 * Service for fetching and processing weather data from Open-Meteo API
 */

import { fetchWeatherApi } from 'openmeteo';
import { addDays, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import axios from 'axios';

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Weather location interface
 */
export interface WeatherLocation {
  latitude: number;
  longitude: number;
  label: string;
}

/**
 * Current weather data interface
 */
export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  time: string;
}

/**
 * Daily weather data interface
 */
export interface DailyWeather {
  date: string;
  weatherCode: number;
  weatherDescription: string;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: string;
  sunset: string;
  precipitation: number;
  precipitationProbability: number;
  precipitationHours: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
}

/**
 * Hourly weather data interface
 */
export interface HourlyWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  precipitation: number;
  precipitationProbability: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
}

/**
 * Weather data interface
 */
export interface WeatherData {
  location: WeatherLocation;
  timezone: string;
  current: CurrentWeather;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
  timestamp: number;
}

/**
 * Cache interface
 */
interface WeatherCache {
  [key: string]: {
    data: WeatherData;
    timestamp: number;
  };
}

/**
 * Weather code descriptions
 */
const weatherCodeDescriptions: { [key: number]: string } = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

/**
 * Helper function to safely convert time values that might be BigInt
 */
function safeTimeConversion(time: number | bigint): number {
  // Convert BigInt to Number if needed
  if (typeof time === 'bigint') {
    return Number(time);
  }
  return time;
}

/**
 * Weather service class
 */
class WeatherService {
  private cache: WeatherCache = {};

  /**
   * Get weather description from code
   */
  getWeatherDescription(code: number): string {
    return weatherCodeDescriptions[code] || 'Unknown';
  }

  /**
   * Get cache key for location
   */
  private getCacheKey(location: WeatherLocation): string {
    return `${location.latitude},${location.longitude}`;
  }

  /**
   * Check if cached data is valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const cachedData = this.cache[cacheKey];
    if (!cachedData) return false;
    
    const now = Date.now();
    return now - cachedData.timestamp < CACHE_DURATION;
  }

  /**
   * Get user's current location
   */
  async getUserLocation(): Promise<WeatherLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          try {
            // Try to get a location name using reverse geocoding
            const locationName = await this.getLocationName(latitude, longitude);
            
            resolve({
              latitude,
              longitude,
              label: locationName
            });
          } catch (error) {
            // Fall back to coordinates if geocoding fails
            resolve({
              latitude,
              longitude,
              label: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject('Unable to retrieve your location');
        }
      );
    });
  }

  /**
   * Get location name from coordinates using reverse geocoding
   */
  async getLocationName(latitude: number, longitude: number): Promise<string> {
    try {
      // Use OpenStreetMap's Nominatim service for reverse geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            'Accept-Language': 'en-US,en',
            'User-Agent': 'BeckDash Weather App'
          }
        }
      );
      
      const data = response.data;
      
      // Extract a readable location name
      if (data.display_name) {
        // Parse the display name to get a more concise location
        const parts = data.display_name.split(',');
        if (parts.length >= 2) {
          return `${parts[0].trim()}, ${parts[1].trim()}`;
        }
        return parts[0].trim();
      }
      
      if (data.address) {
        const parts = [];
        if (data.address.city) parts.push(data.address.city);
        else if (data.address.town) parts.push(data.address.town);
        else if (data.address.village) parts.push(data.address.village);
        
        if (data.address.state) parts.push(data.address.state);
        else if (data.address.county) parts.push(data.address.county);
        
        if (parts.length > 0) return parts.join(', ');
      }
      
      // Fall back to coordinates if no readable name is found
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    } catch (error) {
      console.error('Error getting location name:', error);
      // Fall back to coordinates
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    }
  }

  /**
   * Fetch weather data from Open-Meteo API
   */
  async getWeatherData(location: WeatherLocation): Promise<WeatherData> {
    const cacheKey = this.getCacheKey(location);
    
    // Clear cache to ensure fresh data
    delete this.cache[cacheKey];
    
    try {
      console.log('Fetching fresh weather data for:', location);
      
      // API parameters
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "rain",
          "weather_code",
          "cloud_cover",
          "pressure_msl",
          "surface_pressure",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
          "uv_index"
        ],
        hourly: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation_probability",
          "precipitation",
          "weather_code",
          "cloud_cover",
          "visibility",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
          "uv_index",
          "is_day",
          "pressure_msl"
        ],
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "apparent_temperature_max",
          "apparent_temperature_min",
          "sunrise",
          "sunset",
          "uv_index_max",
          "precipitation_sum",
          "precipitation_hours",
          "precipitation_probability_max",
          "wind_speed_10m_max",
          "wind_gusts_10m_max",
          "wind_direction_10m_dominant"
        ],
        timezone: "auto",
        forecast_days: 14 // Request 14 days of forecast data
      };
      
      // Fetch data from API
      console.log('API parameters:', params);
      
      // Use direct fetch instead of the openmeteo package
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      
      // Add parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','));
        } else {
          url.searchParams.append(key, value.toString());
        }
      });
      
      console.log('Fetching from URL:', url.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API raw response:', data);
      
      if (!data) {
        throw new Error('No data received from weather API');
      }
      
      // Process timezone
      const timezone = data.timezone || 'UTC';
      const utcOffsetSeconds = data.utc_offset_seconds || 0;
      
      // Process current weather
      const current: CurrentWeather = {
        temperature: data.current?.temperature_2m || 0,
        humidity: data.current?.relative_humidity_2m || 0,
        apparentTemperature: data.current?.apparent_temperature || 0,
        isDay: data.current?.is_day === 1,
        precipitation: data.current?.precipitation || 0,
        weatherCode: data.current?.weather_code || 0,
        weatherDescription: this.getWeatherDescription(data.current?.weather_code || 0),
        cloudCover: data.current?.cloud_cover || 0,
        pressure: data.current?.pressure_msl || 0,
        windSpeed: data.current?.wind_speed_10m || 0,
        windDirection: data.current?.wind_direction_10m || 0,
        windGusts: data.current?.wind_gusts_10m || 0,
        visibility: 0, // Not available in current
        uvIndex: data.current?.uv_index || 0,
        time: data.current?.time || new Date().toISOString()
      };
      
      // Process hourly data
      const hourlyWeatherData: HourlyWeather[] = [];
      
      if (data.hourly) {
        const hourlyTimes = data.hourly.time || [];
        const hourlyCount = hourlyTimes.length;
        
        console.log(`Processing ${hourlyCount} hours of forecast data`);
        
        for (let i = 0; i < hourlyCount; i++) {
          try {
            hourlyWeatherData.push({
              time: hourlyTimes[i] || new Date().toISOString(),
              temperature: data.hourly.temperature_2m?.[i] || 0,
              humidity: data.hourly.relative_humidity_2m?.[i] || 0,
              apparentTemperature: data.hourly.apparent_temperature?.[i] || 0,
              precipitationProbability: data.hourly.precipitation_probability?.[i] || 0,
              precipitation: data.hourly.precipitation?.[i] || 0,
              weatherCode: data.hourly.weather_code?.[i] || 0,
              weatherDescription: this.getWeatherDescription(data.hourly.weather_code?.[i] || 0),
              cloudCover: data.hourly.cloud_cover?.[i] || 0,
              visibility: data.hourly.visibility?.[i] || 0,
              windSpeed: data.hourly.wind_speed_10m?.[i] || 0,
              windDirection: data.hourly.wind_direction_10m?.[i] || 0,
              windGusts: data.hourly.wind_gusts_10m?.[i] || 0,
              uvIndex: data.hourly.uv_index?.[i] || 0,
              isDay: data.hourly.is_day?.[i] === 1,
              pressure: data.hourly.pressure_msl?.[i] || 0
            });
          } catch (error) {
            console.error(`Error processing hourly data at index ${i}:`, error);
          }
        }
      } else {
        console.warn('No hourly data available');
      }
      
      // Process daily data
      const dailyWeatherData: DailyWeather[] = [];
      
      if (data.daily) {
        const dailyTimes = data.daily.time || [];
        const dailyCount = dailyTimes.length;
        
        console.log(`Processing ${dailyCount} days of forecast data`);
        
        for (let i = 0; i < dailyCount; i++) {
          try {
            dailyWeatherData.push({
              date: dailyTimes[i] || new Date().toISOString(),
              weatherCode: data.daily.weather_code?.[i] || 0,
              weatherDescription: this.getWeatherDescription(data.daily.weather_code?.[i] || 0),
              temperatureMax: data.daily.temperature_2m_max?.[i] || 0,
              temperatureMin: data.daily.temperature_2m_min?.[i] || 0,
              apparentTemperatureMax: data.daily.apparent_temperature_max?.[i] || 0,
              apparentTemperatureMin: data.daily.apparent_temperature_min?.[i] || 0,
              sunrise: data.daily.sunrise?.[i] || new Date().toISOString(),
              sunset: data.daily.sunset?.[i] || new Date().toISOString(),
              uvIndex: data.daily.uv_index_max?.[i] || 0,
              precipitation: data.daily.precipitation_sum?.[i] || 0,
              precipitationHours: data.daily.precipitation_hours?.[i] || 0,
              precipitationProbability: data.daily.precipitation_probability_max?.[i] || 0,
              windSpeed: data.daily.wind_speed_10m_max?.[i] || 0,
              windGusts: data.daily.wind_gusts_10m_max?.[i] || 0,
              windDirection: data.daily.wind_direction_10m_dominant?.[i] || 0
            });
          } catch (error) {
            console.error(`Error processing daily data at index ${i}:`, error);
          }
        }
      } else {
        console.warn('No daily data available');
      }
      
      // Create weather data object
      const weatherData: WeatherData = {
        location,
        timezone,
        current,
        daily: dailyWeatherData,
        hourly: hourlyWeatherData,
        timestamp: Date.now()
      };
      
      console.log('Weather data processed successfully:', {
        location: weatherData.location,
        currentTemp: weatherData.current.temperature,
        dailyCount: weatherData.daily.length,
        hourlyCount: weatherData.hourly.length
      });
      
      // Cache the data
      this.cache[cacheKey] = {
        data: weatherData,
        timestamp: Date.now()
      };
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Get weather alerts based on weather data
   */
  getWeatherAlerts(weatherData: WeatherData): { type: 'info' | 'warning' | 'severe'; message: string }[] {
    const alerts: { type: 'info' | 'warning' | 'severe'; message: string }[] = [];
    
    // Check if we have valid data
    if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) {
      return alerts;
    }
    
    // Check for severe weather in the next 24 hours
    const next24Hours = weatherData.hourly.slice(0, Math.min(24, weatherData.hourly.length));
    
    // Check for extreme temperatures
    const temperatures = next24Hours.map(h => h.temperature).filter(t => !isNaN(t));
    if (temperatures.length === 0) return alerts;
    
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    
    if (maxTemp > 35) {
      alerts.push({
        type: 'severe',
        message: `Extreme heat expected with temperatures reaching ${Math.round(maxTemp)}°C (${Math.round((maxTemp * 9/5) + 32)}°F). Stay hydrated and avoid prolonged sun exposure.`
      });
    } else if (maxTemp > 30) {
      alerts.push({
        type: 'warning',
        message: `High temperatures expected with a high of ${Math.round(maxTemp)}°C (${Math.round((maxTemp * 9/5) + 32)}°F). Stay hydrated and take breaks from the heat.`
      });
    }
    
    if (minTemp < -10) {
      alerts.push({
        type: 'severe',
        message: `Extreme cold expected with temperatures dropping to ${Math.round(minTemp)}°C (${Math.round((minTemp * 9/5) + 32)}°F). Limit time outdoors and dress in layers.`
      });
    } else if (minTemp < 0) {
      alerts.push({
        type: 'warning',
        message: `Freezing temperatures expected with a low of ${Math.round(minTemp)}°C (${Math.round((minTemp * 9/5) + 32)}°F). Be cautious of icy conditions.`
      });
    }
    
    // Check for precipitation
    const highPrecipHours = next24Hours.filter(h => h.precipitation > 5);
    if (highPrecipHours.length > 3 && highPrecipHours[0] && highPrecipHours[0].time) {
      try {
        const startTime = format(parseISO(highPrecipHours[0].time), 'h a');
        alerts.push({
          type: 'warning',
          message: `Heavy precipitation expected starting around ${startTime}. Be prepared for potential flooding or difficult travel conditions.`
        });
      } catch (error) {
        alerts.push({
          type: 'warning',
          message: `Heavy precipitation expected. Be prepared for potential flooding or difficult travel conditions.`
        });
      }
    }
    
    // Check for strong winds
    const highWindHours = next24Hours.filter(h => h.windSpeed > 40);
    if (highWindHours.length > 0) {
      const windGusts = highWindHours.map(h => h.windGusts).filter(g => !isNaN(g));
      const maxGust = windGusts.length > 0 ? Math.max(...windGusts) : 0;
      
      alerts.push({
        type: 'warning',
        message: `Strong winds expected${maxGust > 0 ? ` with gusts up to ${Math.round(maxGust)} km/h (${Math.round(maxGust * 0.621371)} mph)` : ''}. Secure loose objects outdoors.`
      });
    }
    
    // Check for severe weather codes
    const severeWeatherCodes = [95, 96, 99]; // Thunderstorms with hail
    const hasSevereWeather = next24Hours.some(h => severeWeatherCodes.includes(h.weatherCode));
    
    if (hasSevereWeather) {
      alerts.push({
        type: 'severe',
        message: 'Thunderstorms with potential hail expected. Seek shelter when storms approach.'
      });
    }
    
    // Check for moderate weather codes
    const moderateWeatherCodes = [80, 81, 82, 85, 86]; // Heavy rain or snow showers
    const hasModerateWeather = next24Hours.some(h => moderateWeatherCodes.includes(h.weatherCode));
    
    if (hasModerateWeather && !hasSevereWeather) {
      alerts.push({
        type: 'info',
        message: 'Periods of heavy precipitation expected. Consider adjusting outdoor plans.'
      });
    }
    
    // If no alerts but high UV index, add info alert
    if (alerts.length === 0) {
      const uvIndices = next24Hours.map(h => h.uvIndex).filter(uv => !isNaN(uv));
      if (uvIndices.length > 0 && Math.max(...uvIndices) > 7) {
        alerts.push({
          type: 'info',
          message: 'High UV index expected. Wear sunscreen and protective clothing if spending time outdoors.'
        });
      }
    }
    
    return alerts;
  }

  /**
   * Get weather recommendation based on weather data
   */
  getWeatherRecommendation(weatherData: WeatherData): string {
    // Check if we have valid data
    if (!weatherData || !weatherData.current) {
      return "Weather data is currently unavailable. Please try again later.";
    }

    const current = weatherData.current;
    const today = weatherData.daily && weatherData.daily.length > 0 ? weatherData.daily[0] : null;
    
    // Check for precipitation
    if (current.precipitation > 0.5) {
      return "It's currently raining. Don't forget your umbrella if heading out!";
    }
    
    // Check for high precipitation probability in next few hours
    if (weatherData.hourly && weatherData.hourly.length > 0) {
      const nextFewHours = weatherData.hourly.slice(0, 6);
      const highPrecipProbability = nextFewHours.some(h => h.precipitationProbability > 70);
      
      if (highPrecipProbability) {
        return "High chance of precipitation in the next few hours. Keep an umbrella handy.";
      }
    }
    
    // Check for extreme temperatures
    if (current.temperature > 30) {
      return "It's very hot today. Stay hydrated, wear light clothing, and limit sun exposure during peak hours.";
    }
    
    if (current.temperature < 0) {
      return "Freezing temperatures today. Dress warmly in layers and be cautious of icy conditions.";
    }
    
    // Check for high UV
    if (today && today.uvIndex !== undefined && today.uvIndex > 7) {
      return "High UV levels today. Wear sunscreen, sunglasses, and a hat if spending time outdoors.";
    }
    
    // Check for strong winds
    if (current.windSpeed > 30) {
      return "Strong winds today. Secure loose objects outdoors and be cautious when driving.";
    }
    
    // Pleasant weather
    if (current.temperature > 20 && current.temperature < 28 && current.humidity < 70 && current.cloudCover < 50) {
      return "Beautiful weather today! Perfect conditions for outdoor activities.";
    }
    
    // Cloudy but mild
    if (current.cloudCover > 70 && current.temperature > 15 && current.temperature < 25) {
      return "Cloudy but mild conditions today. Good for outdoor activities that don't require bright sunshine.";
    }
    
    // Cold but clear
    if (current.temperature < 10 && current.cloudCover < 30) {
      return "Cold but clear day. Dress warmly and enjoy the sunshine.";
    }
    
    // Default recommendation
    return "Check the hourly forecast to plan your day accordingly.";
  }
}

export default new WeatherService();
