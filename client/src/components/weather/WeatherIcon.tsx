/**
 * Weather Icon Component
 *
 * Displays a weather icon based on the weather code or icon name
 */

import React from 'react';
import { 
  FaSun, 
  FaMoon, 
  FaCloudSun, 
  FaCloudMoon, 
  FaCloud, 
  FaCloudRain, 
  FaSnowflake, 
  FaBolt, 
  FaWind,
  FaTint
} from 'react-icons/fa';

/**
 * Size variants for the icon
 */
type WeatherIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the WeatherIcon component
 */
interface WeatherIconProps {
  /** Weather icon name */
  icon: string;
  /** Size of the icon */
  size?: WeatherIconSize;
  /** Additional CSS class names */
  className?: string;
}

/**
 * The size classes for each size variant
 */
const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

/**
 * Weather Icon Component
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  icon, 
  size = 'md', 
  className = '' 
}) => {
  // Size class for the icon
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  /**
   * Get appropriate color for the icon
   */
  const getIconColor = (iconName: string): string => {
    switch (iconName) {
      case 'clear-day':
      case 'sunny':
        return 'text-yellow-400';
      case 'clear-night':
        return 'text-blue-300';
      case 'partly-cloudy-day':
      case 'partly-cloudy-night':
      case 'cloudy':
        return 'text-gray-400';
      case 'fog':
      case 'wind':
        return 'text-gray-300';
      case 'rain':
      case 'drizzle':
        return 'text-blue-400';
      case 'snow':
      case 'sleet':
        return 'text-blue-200';
      case 'thunderstorm':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };
  
  /**
   * Render the appropriate icon based on icon name
   */
  const renderIcon = () => {
    const colorClass = getIconColor(icon);
    const fullClassName = `${sizeClass} ${colorClass} ${className}`;
    
    switch (icon) {
      case 'clear-day':
      case 'sunny':
        return <FaSun className={fullClassName} />;
      case 'clear-night':
        return <FaMoon className={fullClassName} />;
      case 'partly-cloudy-day':
        return <FaCloudSun className={fullClassName} />;
      case 'partly-cloudy-night':
        return <FaCloudMoon className={fullClassName} />;
      case 'cloudy':
      case 'fog':
        return <FaCloud className={fullClassName} />;
      case 'rain':
      case 'drizzle':
        return <FaCloudRain className={fullClassName} />;
      case 'heavy-rain':
        return <FaCloudRain className={fullClassName} />;
      case 'snow':
      case 'sleet':
        return <FaSnowflake className={fullClassName} />;
      case 'thunderstorm':
        return <FaBolt className={fullClassName} />;
      case 'wind':
        return <FaWind className={fullClassName} />;
      case 'humidity':
        return <FaTint className={fullClassName} />;
      default:
        return <FaCloud className={fullClassName} />;
    }
  };
  
  return renderIcon();
};

export default WeatherIcon; 