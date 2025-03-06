/**
 * Calendar Hook
 *
 * Custom hook for managing calendar state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Event, EventsFilter } from '../types/Event';
import calendarService from '../services/calendar.service';
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  getCalendarDays
} from '../utils/dateUtils';

// View types for the calendar
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// Hook interface
interface UseCalendarProps {
  initialDate?: Date;
  initialView?: CalendarView;
}

interface UseCalendarResult {
  // State
  currentDate: Date;
  selectedDate: Date;
  view: CalendarView;
  events: Event[];
  calendarDays: Date[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToToday: () => void;

  // Event actions
  fetchEvents: (filter?: EventsFilter) => Promise<void>;
  createEvent: (eventData: any) => Promise<Event>;
  updateEvent: (id: string, eventData: any) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;

  // Helper functions
  getEventsForDate: (date: Date) => Event[];
}

/**
 * Custom hook for managing calendar state and operations
 */
export const useCalendar = ({
  initialDate = new Date(),
  initialView = 'month'
}: UseCalendarProps = {}): UseCalendarResult => {
  // State
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Navigation actions
  const prevMonth = useCallback(() => {
    setCurrentDate(subMonths(currentDate, 1));
  }, [currentDate]);

  const nextMonth = useCallback(() => {
    setCurrentDate(addMonths(currentDate, 1));
  }, [currentDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  // Fetch events from API
  const fetchEvents = useCallback(async (filter?: EventsFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      // If no filter provided, fetch events for the current month
      if (!filter) {
        // Get start and end of the month based on currentDate
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        filter = {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      }

      const response = await calendarService.getEvents(filter);
      setEvents(response.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  // Create a new event
  const createEvent = async (eventData: any): Promise<Event> => {
    setIsLoading(true);
    setError(null);

    try {
      const createdEvent = await calendarService.createEvent(eventData);
      setEvents(prev => [...prev, createdEvent]);
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, eventData: any): Promise<Event> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedEvent = await calendarService.updateEvent(id, eventData);
      setEvents(prev =>
        prev.map(event => event.id === id ? updatedEvent : event)
      );
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await calendarService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date): Event[] => {
    // Format the date to compare just the date part (not the time)
    const dateStr = date.toISOString().split('T')[0];

    return events.filter(event => {
      const eventStart = new Date(event.startDate).toISOString().split('T')[0];
      const eventEnd = new Date(event.endDate).toISOString().split('T')[0];

      // Check if the date falls within the event dates
      return (eventStart <= dateStr && eventEnd >= dateStr);
    });
  }, [events]);

  // Update calendar days when current date changes
  useEffect(() => {
    setCalendarDays(getCalendarDays(currentDate));
  }, [currentDate]);

  // Fetch events when the component mounts or currentDate changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    currentDate,
    selectedDate,
    view,
    events,
    calendarDays,
    isLoading,
    error,
    setCurrentDate,
    setSelectedDate,
    setView,
    prevMonth,
    nextMonth,
    goToToday,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
  };
};

export default useCalendar;