/**
 * Calendar Service
 *
 * Business logic for calendar events
 */

import { Event, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { PaginationParams, PaginatedResponse } from '../types';
import logger from '../utils/logger';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';

// Calendar filters interface
interface CalendarFilters extends PaginationParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
}

// Interface for recurring event instances
interface EventInstance extends Omit<Event, 'id'> {
  id: string;
  originalEventId?: string;
  isInstance?: boolean;
}

// Calendar service methods
export const calendarService = {
  /**
   * Get all events with optional filtering
   */
  async getEvents(
    userId: string,
    filters: CalendarFilters
  ): Promise<PaginatedResponse<Event>> {
    const { startDate, endDate, category, search, page = 1, limit = 10 } = filters;

    // Build filter conditions
    const where: Prisma.EventWhereInput = {
      userId,
    };

    // Add date range filter
    if (startDate || endDate) {
      where.AND = [];

      if (startDate) {
        where.AND.push({
          OR: [
            { startDate: { gte: new Date(startDate) } },
            { endDate: { gte: new Date(startDate) } },
          ],
        });
      }

      if (endDate) {
        where.AND.push({
          OR: [
            { startDate: { lte: new Date(endDate) } },
            { endDate: { lte: new Date(endDate) } },
          ],
        });
      }
    }

    // Add category filter
    if (category) {
      where.category = category;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.event.count({ where });

    // Get events
    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      skip,
      take: limit,
    });

    // Expand recurring events if date range is provided
    let expandedEvents = [...events];
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Get recurring events
      const recurringEvents = events.filter(event => event.isRecurring && event.recurrence);
      
      // Expand recurring events
      for (const event of recurringEvents) {
        const recurrenceInstances = this.expandRecurringEvent(
          event, 
          startDateObj, 
          endDateObj
        );
        
        // Add expanded instances to the result
        expandedEvents = [...expandedEvents, ...recurrenceInstances];
      }
      
      // Sort events by start date
      expandedEvents.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    }

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: expandedEvents,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  /**
   * Expand a recurring event into individual instances
   */
  expandRecurringEvent(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
    if (!event.isRecurring || !event.recurrence) {
      return [];
    }

    const instances: Event[] = [];
    const recurrence = event.recurrence as any;
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const duration = eventEnd.getTime() - eventStart.getTime();

    // Maximum number of instances to generate to prevent infinite loops
    const MAX_INSTANCES = 100;
    
    // Get recurrence type and interval
    const type = recurrence.type || 'none';
    const interval = recurrence.interval || 1;
    
    // Calculate end date for recurrence
    let recurrenceEndDate = rangeEnd;
    if (recurrence.endDate) {
      const endDate = new Date(recurrence.endDate);
      if (isBefore(endDate, rangeEnd)) {
        recurrenceEndDate = endDate;
      }
    }
    
    // Generate instances based on recurrence type
    let currentDate = new Date(eventStart);
    let instanceCount = 0;
    
    while (isBefore(currentDate, recurrenceEndDate) && instanceCount < MAX_INSTANCES) {
      // Skip the original event
      if (instanceCount > 0) {
        // Only include instances that fall within the range
        if (!isBefore(currentDate, rangeStart) && !isAfter(currentDate, recurrenceEndDate)) {
          const instanceEndDate = new Date(currentDate.getTime() + duration);
          
          // Create a new instance with a unique ID
          const instance = {
            ...event,
            id: `${event.id}-instance-${instanceCount}`,
            startDate: currentDate,
            endDate: instanceEndDate,
            // Add metadata as part of the title to indicate it's a recurring instance
            title: `${event.title} (Recurring)`,
          };
          
          instances.push(instance as Event);
        }
      }
      
      // Calculate next occurrence based on recurrence type
      switch (type) {
        case 'daily':
          currentDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, interval);
          break;
        default:
          // No more instances for unknown recurrence types
          instanceCount = MAX_INSTANCES;
      }
      
      instanceCount++;
      
      // Stop if we've reached the maximum count specified in recurrence
      if (recurrence.count && instanceCount >= recurrence.count) {
        break;
      }
    }
    
    return instances;
  },

  /**
   * Get a single event by ID
   */
  async getEventById(id: string, userId: string): Promise<Event | null> {
    return prisma.event.findFirst({
      where: {
        id,
        userId,
      },
    });
  },

  /**
   * Create a new event
   */
  async createEvent(data: Prisma.EventCreateInput, userId: string): Promise<Event> {
    // Validate dates
    const startDate = new Date(data.startDate as string | Date);
    const endDate = new Date(data.endDate as string | Date);

    if (endDate < startDate) {
      throw new AppError('End date cannot be before start date', 400);
    }

    try {
      // Create event
      const event = await prisma.event.create({
        data: {
          ...data,
          startDate,
          endDate,
          user: { connect: { id: userId } },
        },
      });

      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw new AppError('Failed to create event', 500);
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(
    id: string,
    data: Partial<Prisma.EventUpdateInput>,
    userId: string
  ): Promise<Event> {
    // Validate dates if both are provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate as string | Date);
      const endDate = new Date(data.endDate as string | Date);

      if (endDate < startDate) {
        throw new AppError('End date cannot be before start date', 400);
      }
    }

    try {
      // Update event
      const event = await prisma.event.update({
        where: {
          id,
          userId,
        },
        data,
      });

      return event;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Event not found', 404);
        }
      }

      logger.error('Error updating event:', error);
      throw new AppError('Failed to update event', 500);
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string, userId: string): Promise<void> {
    try {
      await prisma.event.delete({
        where: {
          id,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Event not found', 404);
        }
      }

      logger.error('Error deleting event:', error);
      throw new AppError('Failed to delete event', 500);
    }
  },

  /**
   * Get upcoming events for a user
   */
  async getUpcomingEvents(userId: string, days = 7): Promise<Event[]> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    return prisma.event.findMany({
      where: {
        userId,
        startDate: {
          gte: today,
          lte: endDate,
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  },

  /**
   * Get today's events for a user
   */
  async getTodayEvents(userId: string): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return prisma.event.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            endDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            AND: [
              { startDate: { lt: today } },
              { endDate: { gt: tomorrow } },
            ],
          },
        ],
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  },
};

export default calendarService;