/**
 * Event type definitions
 *
 * Defines the structure of calendar events in the application
 */

/**
 * Event category type
 */
export type EventCategory =
  | 'default'   // Default/uncategorized
  | 'work'      // Work-related events
  | 'personal'  // Personal appointments
  | 'family'    // Family events
  | 'health'    // Health-related appointments
  | 'finance'   // Financial events
  | 'travel'    // Travel plans
  | 'education' // Education events
  | 'other';    // Custom category

/**
 * Event recurrence type
 */
export type RecurrenceType =
  | 'none'     // One-time event
  | 'daily'    // Every day
  | 'weekly'   // Every week
  | 'monthly'  // Every month
  | 'yearly'   // Every year
  | 'custom';  // Custom recurrence pattern

/**
 * Recurrence pattern for events
 */
export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number;              // Every X days/weeks/months/years
  endDate?: string;              // End date for recurrence
  count?: number;                // Number of occurrences
  daysOfWeek?: number[];         // Days of the week (0 = Sunday, 6 = Saturday)
  dayOfMonth?: number;           // Day of the month
  monthsOfYear?: number[];       // Months of the year (0 = January, 11 = December)
  byMonthDay?: number[];         // Days of the month
  bySetPosition?: number;        // Position in the set (e.g., 1st, 2nd, last)
}

/**
 * Base event interface
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;             // ISO date string
  endDate: string;               // ISO date string
  allDay: boolean;
  location?: string;
  category?: EventCategory;
  color?: string;                // Custom color for the event
  isRecurring: boolean;
  recurrence?: RecurrencePattern;
  reminderTime?: number;         // Minutes before event to send reminder
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
  userId: string;
}

/**
 * Event creation request
 */
export interface CreateEventRequest {
  id?: string;  // Optional id for editing existing events
  title: string;
  description?: string;
  startDate: string;             // ISO date string
  endDate: string;               // ISO date string
  allDay: boolean;
  location?: string;
  category?: EventCategory;
  color?: string;
  isRecurring: boolean;
  recurrence?: RecurrencePattern;
  reminderTime?: number;
}

/**
 * Event update request
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  category?: EventCategory;
  color?: string;
  isRecurring?: boolean;
  recurrence?: RecurrencePattern;
  reminderTime?: number;
}

/**
 * Event response from API
 */
export interface EventResponse {
  event: Event;
}

/**
 * Events list response from API
 */
export interface EventsListResponse {
  events: Event[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Events filter parameters
 */
export interface EventsFilter {
  startDate?: string;
  endDate?: string;
  category?: EventCategory;
  search?: string;
  page?: number;
  limit?: number;
}