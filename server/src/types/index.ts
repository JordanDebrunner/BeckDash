/**
 * Centralized export of all types used in the application
 */

export * from './RequestWithUser';

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Standard paginated response format
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Weather API interfaces
 */
export interface WeatherData {
  city: string;
  country?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  description: string;
  icon: string;
  updatedAt: Date;
}

export interface ForecastData {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  precipitation: number;
}

/**
 * Plant Care interfaces
 */
export interface WateringSchedule {
  frequency: number; // in days
  amount: string;
  lastWatered: Date;
  nextWatering: Date;
}

export interface FertilizingSchedule {
  frequency: number; // in days
  amount: string;
  lastFertilized: Date;
  nextFertilizing: Date;
}

/**
 * Recipe interfaces
 */
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  optional?: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

/**
 * Maintenance interfaces
 */
export interface RecurringSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // e.g., every 2 weeks
  endDate?: Date;
  daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
  dayOfMonth?: number;
  monthsOfYear?: number[]; // 1 = January, 12 = December
}