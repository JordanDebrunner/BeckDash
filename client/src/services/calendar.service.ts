/**
 * Calendar Service
 *
 * Service for managing calendar events in the application
 */

import apiService from './api.service';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventResponse,
  EventsListResponse,
  EventsFilter,
} from '../types/Event';

/**
 * Calendar service class
 */
class CalendarService {
  private readonly baseUrl = '/calendar';

  /**
   * Get all events with optional filtering
   */
  async getEvents(filter?: EventsFilter): Promise<EventsListResponse> {
    // Convert filter object to query string parameters
    const queryParams = filter
      ? Object.entries(filter)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => {
            // Ensure dates are properly formatted as ISO strings
            if (key === 'startDate' || key === 'endDate') {
              return `${key}=${encodeURIComponent(new Date(value as string).toISOString())}`;
            }
            return `${key}=${encodeURIComponent(String(value))}`;
          })
          .join('&')
      : '';

    const url = queryParams
      ? `${this.baseUrl}/events?${queryParams}`
      : `${this.baseUrl}/events`;

    return apiService.get<EventsListResponse>(url);
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<Event> {
    const response = await apiService.get<EventResponse>(`${this.baseUrl}/events/${id}`);
    return response.event;
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    // Ensure dates are sent as ISO strings
    const formattedData = {
      ...eventData,
      startDate: new Date(eventData.startDate).toISOString(),
      endDate: new Date(eventData.endDate).toISOString(),
    };

    const response = await apiService.post<EventResponse>(`${this.baseUrl}/events`, formattedData);
    return response.event;
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, eventData: UpdateEventRequest): Promise<Event> {
    // Format dates if they exist
    const formattedData = {
      ...eventData,
      // Only convert dates if they are provided
      ...(eventData.startDate && { startDate: new Date(eventData.startDate).toISOString() }),
      ...(eventData.endDate && { endDate: new Date(eventData.endDate).toISOString() }),
    };

    const response = await apiService.put<EventResponse>(`${this.baseUrl}/events/${id}`, formattedData);
    return response.event;
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/events/${id}`);
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    // Ensure dates are properly formatted as ISO strings
    const startISO = new Date(startDate).toISOString();
    const endISO = new Date(endDate).toISOString();

    const response = await apiService.get<EventsListResponse>(
      `${this.baseUrl}/events?startDate=${encodeURIComponent(startISO)}&endDate=${encodeURIComponent(endISO)}`
    );
    return response.events;
  }

  /**
   * Get today's events
   */
  async getTodayEvents(): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const endDate = endOfDay.toISOString();

    const response = await this.getEventsByDateRange(startDate, endDate);
    return response;
  }

  /**
   * Get upcoming events (next 7 days)
   */
  async getUpcomingEvents(days = 7): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    endDate.setHours(23, 59, 59, 999);
    const endDateStr = endDate.toISOString();

    const response = await this.getEventsByDateRange(startDate, endDateStr);
    return response;
  }
}

// Create a singleton instance of the Calendar service
const calendarService = new CalendarService();

export default calendarService;