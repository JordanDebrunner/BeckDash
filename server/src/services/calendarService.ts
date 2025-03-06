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

// Calendar filters interface
interface CalendarFilters extends PaginationParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
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

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
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