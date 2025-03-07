/**
 * Maintenance Routes
 *
 * API routes for maintenance tasks
 */

import express from 'express';
import maintenanceController from '../controllers/maintenanceController';
import { simpleAuthenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(simpleAuthenticate);

// Get overdue maintenance tasks - specific routes before parameter routes
router.get('/status/overdue', maintenanceController.getOverdueTasks);

// Get upcoming maintenance tasks - specific routes before parameter routes
router.get('/status/upcoming', maintenanceController.getUpcomingTasks);

// Get all maintenance tasks
router.get('/', maintenanceController.getAllTasks);

// Get a single maintenance task by ID
router.get('/:id', maintenanceController.getTaskById);

// Create a new maintenance task
router.post('/', maintenanceController.createTask);

// Update an existing maintenance task
router.put('/:id', maintenanceController.updateTask);

// Delete a maintenance task
router.delete('/:id', maintenanceController.deleteTask);

// Toggle task completion status
router.put(
  '/:id/toggle-completion',
  maintenanceController.toggleTaskCompletion
);

export default router;
