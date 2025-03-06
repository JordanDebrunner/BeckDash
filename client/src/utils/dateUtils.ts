/**
 * Date utility functions
 *
 * Provides helper functions for date manipulation and formatting
 */

// Format date to YYYY-MM-DD
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format date to locale string (e.g., "Jan 1, 2023")
export const formatDateToLocale = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format time to locale string (e.g., "3:30 PM")
export const formatTimeToLocale = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format date and time (e.g., "Jan 1, 2023, 3:30 PM")
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format relative time (e.g., "2 hours ago", "in 3 days")
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  const isPast = diffInSeconds < 0;
  const prefix = isPast ? '' : 'in ';
  const suffix = isPast ? ' ago' : '';

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (absSeconds < minute) {
    return isPast ? 'just now' : 'in a few seconds';
  } else if (absSeconds < hour) {
    const minutes = Math.floor(absSeconds / minute);
    return `${prefix}${minutes} minute${minutes > 1 ? 's' : ''}${suffix}`;
  } else if (absSeconds < day) {
    const hours = Math.floor(absSeconds / hour);
    return `${prefix}${hours} hour${hours > 1 ? 's' : ''}${suffix}`;
  } else if (absSeconds < week) {
    const days = Math.floor(absSeconds / day);
    return `${prefix}${days} day${days > 1 ? 's' : ''}${suffix}`;
  } else if (absSeconds < month) {
    const weeks = Math.floor(absSeconds / week);
    return `${prefix}${weeks} week${weeks > 1 ? 's' : ''}${suffix}`;
  } else if (absSeconds < year) {
    const months = Math.floor(absSeconds / month);
    return `${prefix}${months} month${months > 1 ? 's' : ''}${suffix}`;
  } else {
    const years = Math.floor(absSeconds / year);
    return `${prefix}${years} year${years > 1 ? 's' : ''}${suffix}`;
  }
};

// Get start of day
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of day
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Get start of week (Sunday)
export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of week (Saturday)
export const endOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (6 - day));
  result.setHours(23, 59, 59, 999);
  return result;
};

// Get start of month
export const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of month
export const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Add days to date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Subtract days from date
export const subDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

// Add months to date
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Subtract months from date
export const subMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

// Check if two dates are in the same month
export const isSameMonth = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth()
  );
};

// Format date range (e.g., "Jan 1 - Jan 5, 2023" or "Jan 1, 2023 - Feb 1, 2023")
export const formatDateRange = (start: Date | string, end: Date | string): string => {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const isSameYear = startYear === endYear;

  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  const isSameMonth = isSameYear && startMonth === endMonth;

  if (isSameMonth) {
    // Same month and year, e.g., "Jan 1 - 5, 2023"
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
  } else if (isSameYear) {
    // Same year, different month, e.g., "Jan 1 - Feb 5, 2023"
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else {
    // Different years, e.g., "Jan 1, 2023 - Feb 5, 2024"
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
};

// Check if date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Check if date is in the past
export const isPast = (date: Date): boolean => {
  return date.getTime() < new Date().getTime();
};

// Check if date is in the future
export const isFuture = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};

// Get days in month
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get day name
export const getDayName = (date: Date, format: 'long' | 'short' = 'long'): string => {
  return date.toLocaleDateString('en-US', { weekday: format });
};

// Get month name
export const getMonthName = (date: Date, format: 'long' | 'short' = 'long'): string => {
  return date.toLocaleDateString('en-US', { month: format });
};

// Generate a date array for calendar view
export const getCalendarDays = (date: Date): Date[] => {
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  const startDay = startOfWeek(firstDayOfMonth);
  const endDay = endOfWeek(lastDayOfMonth);

  const days: Date[] = [];
  let currentDay = startDay;

  while (currentDay <= endDay) {
    days.push(new Date(currentDay));
    currentDay = addDays(currentDay, 1);
  }

  return days;
};

// Parse ISO date string to Date object
export const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

// Get time from date object (e.g., "15:30")
export const getTimeString = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

// Create date from time string (e.g., "15:30")
export const createDateWithTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Calculate duration between two dates in minutes
export const getDurationInMinutes = (start: Date, end: Date): number => {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

// Format duration (e.g., "2 hours 30 minutes")
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  } else if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
};