/**
 * Calendar Controller
 *
 * Handles HTTP requests related to calendar events
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import calendarService from '../services/calendarService';
import { success, badRequest, notFound } from '../utils/responseFormatter';
import logger from '../utils/logger';
import { RequestWithUser } from '../types/RequestWithUser';

// Validation schemas
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Invalid date format'),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: z.any().optional(),
  reminderTime: z.number().int().positive().optional(),
});

const updateEventSchema = eventSchema.partial();

const eventIdSchema = z.object({
  id: z.string().uuid('Invalid event ID')
});

const eventQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

// Calendar controller methods
export const calendarController = {
  /**
   * Get all events with optional filtering
   */
  async getEvents(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate and parse query parameters
      const validationResult = eventQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        return badRequest(res, 'Invalid query parameters', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      const { startDate, endDate, category, search, page, limit } = validationResult.data;

      // Ensure userId is available
      if (!req.userId) {
        return badRequest(res, 'User ID is required');
      }

      // Get events from service
      const events = await calendarService.getEvents(
        req.userId,
        { startDate, endDate, category, search, page, limit }
      );

      return success(res, events);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single event by ID
   */
  async getEvent(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate event ID
      const validationResult = eventIdSchema.safeParse(req.params);
      if (!validationResult.success) {
        return badRequest(res, 'Invalid event ID');
      }

      const { id } = validationResult.data;

      // Ensure userId is available
      if (!req.userId) {
        return badRequest(res, 'User ID is required');
      }

      // Get event from service
      const event = await calendarService.getEventById(id, req.userId);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      return success(res, { event });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new event
   */
  async createEvent(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate request body
      const validationResult = eventSchema.safeParse(req.body);
      if (!validationResult.success) {
        return badRequest(res, 'Validation error', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      const eventData = validationResult.data;

      // Ensure userId is available
      if (!req.userId) {
        return badRequest(res, 'User ID is required');
      }

      // Create event
      const event = await calendarService.createEvent(eventData, req.userId);

      return success(res, { event }, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate event ID
      const idValidation = eventIdSchema.safeParse(req.params);
      if (!idValidation.success) {
        return badRequest(res, 'Invalid event ID');
      }

      const { id } = idValidation.data;

      // Validate request body
      const validationResult = updateEventSchema.safeParse(req.body);
      if (!validationResult.success) {
        return badRequest(res, 'Validation error', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      const eventData = validationResult.data;

      // Ensure userId is available
      if (!req.userId) {
        return badRequest(res, 'User ID is required');
      }

      // Check if event exists
      const existingEvent = await calendarService.getEventById(id, req.userId);
      if (!existingEvent) {
        return notFound(res, 'Event not found');
      }

      // Update event
      const updatedEvent = await calendarService.updateEvent(id, eventData, req.userId);

      return success(res, { event: updatedEvent }, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate event ID
      const validationResult = eventIdSchema.safeParse(req.params);
      if (!validationResult.success) {
        return badRequest(res, 'Invalid event ID');
      }

      const { id } = validationResult.data;

      // Ensure userId is available
      if (!req.userId) {
        return badRequest(res, 'User ID is required');
      }

      // Check if event exists
      const existingEvent = await calendarService.getEventById(id, req.userId);
      if (!existingEvent) {
        return notFound(res, 'Event not found');
      }

      // Delete event
      await calendarService.deleteEvent(id, req.userId);

      return success(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

export default calendarController;