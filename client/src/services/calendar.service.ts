/**
 * Calendar Service
 *
 * Service for managing calendar events in the application
 */

import { apiGet, apiPost, apiPut, apiDelete, createQueryString } from '../utils/apiUtils';
import { ApiError } from '../../../shared/types/api.types';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventResponse,
  EventsListResponse,
  EventsFilter,
} from '../types/Event';

// API base URL
const API_BASE_URL = '/api/v1';

/**
 * Calendar service class
 */
class CalendarService {
  private readonly baseUrl = `${API_BASE_URL}/calendar`;

  /**
   * Get all events with optional filtering
   */
  async getEvents(filter?: EventsFilter): Promise<Event[]> {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('User is not authenticated. Please log in to access calendar events.');
        throw new Error('Authentication required. Please log in to access calendar events.');
      }

      // Build query parameters
      let queryString = '';
      
      if (filter) {
        const params: Record<string, any> = {};
        if (filter.startDate) params.startDate = new Date(filter.startDate).toISOString();
        if (filter.endDate) params.endDate = new Date(filter.endDate).toISOString();
        if (filter.category) params.category = filter.category;
        if (filter.search) params.search = filter.search;
        if (filter.page) params.page = filter.page.toString();
        if (filter.limit) params.limit = filter.limit.toString();
        
        queryString = createQueryString(params);
      }
      
      const url = `${this.baseUrl}/events${queryString}`;
      
      console.log(`Fetching calendar events from: ${url}`);
      const response = await apiGet<EventsListResponse>(url);
      console.log('Calendar events fetched successfully:', response);
      return response.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Handle authentication errors
      if (error instanceof Error) {
        const errorObj = error as any;
        if (errorObj.status === 401) {
          // Dispatch a custom event to notify the app about authentication issues
          window.dispatchEvent(new CustomEvent('auth:required', { 
            detail: { message: 'Please log in to access calendar events' } 
          }));
        }
      }
      
      throw error;
    }
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<Event> {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('User is not authenticated. Please log in to access calendar events.');
        throw new Error('Authentication required. Please log in to access calendar events.');
      }

      const response = await apiGet<EventResponse>(`${this.baseUrl}/events/${id}`);
      return response.event;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      
      // Handle authentication errors
      if (error instanceof Error) {
        const errorObj = error as any;
        if (errorObj.status === 401) {
          // Dispatch a custom event to notify the app about authentication issues
          window.dispatchEvent(new CustomEvent('auth:required', { 
            detail: { message: 'Please log in to access calendar events' } 
          }));
        }
      }
      
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    try {
      // Ensure dates are sent as ISO strings
      const formattedData = {
        ...eventData,
        startDate: new Date(eventData.startDate).toISOString(),
        endDate: new Date(eventData.endDate).toISOString(),
      };

      const response = await apiPost<EventResponse>(`${this.baseUrl}/events`, formattedData);
      return response.event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, eventData: UpdateEventRequest): Promise<Event> {
    try {
      // Format dates if they exist
      const formattedData = {
        ...eventData,
        // Only convert dates if they are provided
        ...(eventData.startDate && { startDate: new Date(eventData.startDate).toISOString() }),
        ...(eventData.endDate && { endDate: new Date(eventData.endDate).toISOString() }),
      };

      const response = await apiPut<EventResponse>(`${this.baseUrl}/events/${id}`, formattedData);
      return response.event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      await apiDelete(`${this.baseUrl}/events/${id}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    try {
      // Ensure dates are properly formatted as ISO strings
      const startISO = new Date(startDate).toISOString();
      const endISO = new Date(endDate).toISOString();

      const params = {
        startDate: startISO,
        endDate: endISO
      };
      
      const queryString = createQueryString(params);
      const response = await apiGet<EventsListResponse>(`${this.baseUrl}/events${queryString}`);
      return response.events;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
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

  /**
   * Get recurring event instances for a specific date range
   */
  async getRecurringEventInstances(eventId: string, startDate: string, endDate: string): Promise<Event[]> {
    const url = `${this.baseUrl}/events/${eventId}/instances?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    const response = await apiGet<EventsListResponse>(url);
    return response.events;
  }

  /**
   * Update a single instance of a recurring event
   */
  async updateRecurringEventInstance(eventId: string, instanceDate: string, eventData: UpdateEventRequest): Promise<Event> {
    const url = `${this.baseUrl}/events/${eventId}/instances/${encodeURIComponent(instanceDate)}`;
    const response = await apiPut<EventResponse>(url, eventData);
    return response.event;
  }

  /**
   * Delete a single instance of a recurring event
   */
  async deleteRecurringEventInstance(eventId: string, instanceDate: string): Promise<void> {
    const url = `${this.baseUrl}/events/${eventId}/instances/${encodeURIComponent(instanceDate)}`;
    await apiDelete(url);
  }

  /**
   * Get a specific event by ID
   */
  async getEventById(id: string): Promise<Event> {
    try {
      const response = await apiGet<EventResponse>(`${this.baseUrl}/events/${id}`);
      return response.event;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance of the Calendar service
const calendarService = new CalendarService();

export default calendarService;