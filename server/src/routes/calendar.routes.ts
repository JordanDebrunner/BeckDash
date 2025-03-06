/**
 * Calendar Routes
 *
 * Routes for calendar events
 */

import { Router } from 'express';
import calendarController from '../controllers/calendarController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validator';
import { z } from 'zod';

const router = Router();

// Apply authentication middleware to all calendar routes
router.use(authenticate);

// Validation schemas
const createEventSchema = z.object({
  body: z.object({
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
  }),
});

const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
    description: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Invalid date format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Invalid date format').optional(),
    allDay: z.boolean().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrence: z.any().optional(),
    reminderTime: z.number().int().positive().optional(),
  }),
});

const eventIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID'),
  }),
});

// Routes
router.get('/events', calendarController.getEvents);
router.get('/events/:id', validate(eventIdSchema), calendarController.getEvent);
router.post('/events', validate(createEventSchema), calendarController.createEvent);
router.put('/events/:id', validate(updateEventSchema), calendarController.updateEvent);
router.delete('/events/:id', validate(eventIdSchema), calendarController.deleteEvent);

export default router;