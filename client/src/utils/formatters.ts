/**
 * Formatter utility functions
 *
 * Provides helper functions for formatting different types of data
 */

/**
 * Format a number as currency
 *
 * @param amount - The number to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with commas
 *
 * @param number - The number to format
 * @param fractionDigits - The number of decimal places (default: 0)
 * @returns Formatted number string with commas
 */
export const formatNumber = (
  number: number,
  fractionDigits = 0
): string => {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

/**
 * Format a percentage
 *
 * @param value - The decimal value to format as percentage
 * @param fractionDigits - The number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercent = (
  value: number,
  fractionDigits = 0
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

/**
 * Format a file size in bytes to a human-readable format
 *
 * @param bytes - The file size in bytes
 * @param decimals - The number of decimal places (default: 2)
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export const formatFileSize = (
  bytes: number,
  decimals = 2
): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Truncate a string if it exceeds a certain length
 *
 * @param text - The string to truncate
 * @param maxLength - The maximum length (default: 50)
 * @param ellipsis - The ellipsis string (default: "...")
 * @returns Truncated string
 */
export const truncateText = (
  text: string,
  maxLength = 50,
  ellipsis = '...'
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + ellipsis;
};

/**
 * Format a phone number to a standardized format
 *
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number (e.g., "(123) 456-7890")
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if the number is valid
  if (cleaned.length !== 10) return phoneNumber;

  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

/**
 * Format a name to title case
 *
 * @param name - The name to format
 * @returns Name in title case (e.g., "John Doe")
 */
export const formatName = (name: string): string => {
  if (!name) return '';

  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format an email address to hide part of it
 *
 * @param email - The email address to format
 * @returns Partially hidden email (e.g., "j***@example.com")
 */
export const formatEmailProtected = (email: string): string => {
  if (!email || !email.includes('@')) return email;

  const [username, domain] = email.split('@');
  const hiddenUsername = username.charAt(0) + '*'.repeat(username.length - 1);

  return `${hiddenUsername}@${domain}`;
};

/**
 * Get the initials from a name
 *
 * @param name - The name to get initials from
 * @param maxInitials - Maximum number of initials to return (default: 2)
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (
  name: string | null | undefined,
  maxInitials = 2
): string => {
  if (!name) return '';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, maxInitials)
    .map(word => word[0].toUpperCase())
    .join('');
};

/**
 * Convert Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * Format temperature with unit
 */
export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'F'): string => {
  if (unit === 'F') {
    // Convert from Celsius to Fahrenheit
    temp = celsiusToFahrenheit(temp);
  }
  return `${Math.round(temp)}°${unit}`;
};

/**
 * Format wind speed with unit
 */
export const formatWindSpeed = (speed: number, unit: 'km/h' | 'mph' = 'mph'): string => {
  if (unit === 'mph') {
    // Convert from km/h to mph
    speed = speed * 0.621371;
  }
  return `${Math.round(speed)} ${unit}`;
};

/**
 * Format a measurement with unit
 *
 * @param value - The measurement value
 * @param unit - The measurement unit
 * @returns Formatted measurement string (e.g., "5 cups")
 */
export const formatMeasurement = (
  value: number,
  unit: string
): string => {
  return `${value} ${unit}${value !== 1 && !unit.endsWith('s') ? 's' : ''}`;
};

/**
 * Format date to display day name
 */
export const formatDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Format date to display full day name
 */
export const formatFullDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Format date to display month and day
 */
export const formatMonthDay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format date to display full date
 */
export const formatFullDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time to display hours and minutes
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format precipitation with unit
 */
export const formatPrecipitation = (amount: number, unit: 'mm' | 'in' = 'in'): string => {
  if (unit === 'in') {
    // Convert from mm to inches
    amount = amount / 25.4;
  }
  return `${amount.toFixed(1)} ${unit}`;
};

/**
 * Format precipitation probability as percentage
 */
export const formatPrecipitationProbability = (probability: number): string => {
  return `${Math.round(probability)}%`;
};

/**
 * Format humidity as percentage
 */
export const formatHumidity = (humidity: number): string => {
  return `${Math.round(humidity)}%`;
};

/**
 * Format pressure with unit
 */
export const formatPressure = (pressure: number, unit: 'hPa' | 'inHg' = 'inHg'): string => {
  if (unit === 'inHg') {
    // Convert from hPa to inHg
    pressure = pressure * 0.02953;
  }
  return `${Math.round(pressure)} ${unit}`;
};

/**
 * Format visibility with unit
 */
export const formatVisibility = (visibility: number, unit: 'km' | 'mi' = 'mi'): string => {
  // Convert meters to kilometers
  const km = visibility / 1000;
  
  if (unit === 'mi') {
    // Convert kilometers to miles
    const miles = km * 0.621371;
    return miles < 1 ? `${(miles * 5280).toFixed(0)} ft` : `${miles.toFixed(1)} mi`;
  }
  
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
};

/**
 * Format UV index with description
 */
export const formatUVIndex = (uvIndex: number): { value: string; description: string } => {
  let description = '';
  
  if (uvIndex <= 2) {
    description = 'Low';
  } else if (uvIndex <= 5) {
    description = 'Moderate';
  } else if (uvIndex <= 7) {
    description = 'High';
  } else if (uvIndex <= 10) {
    description = 'Very High';
  } else {
    description = 'Extreme';
  }
  
  return {
    value: Math.round(uvIndex).toString(),
    description
  };
};

/**
 * Format wind direction as cardinal direction
 */
export const formatWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};