/**
 * Maintenance Controller
 *
 * Handles HTTP requests related to maintenance tasks
 */

import { Request, Response } from 'express';
import { success, badRequest, notFound, serverError } from '../utils/responseFormatter';
import maintenanceService from '../services/maintenanceService';
import { RequestWithUser } from '../middleware/authMiddleware';
import logger from '../utils/logger';

// Maintenance controller methods
const maintenanceController = {
  /**
   * Get all maintenance tasks for the authenticated user
   */
  async getAllTasks(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      logger.debug(`Getting all maintenance tasks for user ID: ${userId}`);
      
      if (!userId) {
        logger.error('User ID is missing in request');
        return badRequest(res, 'User not authenticated');
      }

      try {
        logger.debug(`Fetching tasks from database for user ${userId}`);
        const tasks = await maintenanceService.getAllTasks(userId);
        logger.debug(`Retrieved ${tasks.length} tasks for user ${userId}`);
        return success(res, { tasks }, 'Maintenance tasks retrieved successfully');
      } catch (dbError) {
        logger.error(`Database error fetching tasks for user ${userId}:`, dbError);
        return serverError(res, 'Database error retrieving maintenance tasks');
      }
    } catch (error) {
      logger.error('Error in getAllTasks:', error);
      return serverError(res, 'Failed to retrieve maintenance tasks');
    }
  },

  /**
   * Get a single maintenance task by ID
   */
  async getTaskById(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      if (!id) {
        return badRequest(res, 'Task ID is required');
      }

      const task = await maintenanceService.getTaskById(id, userId);
      if (!task) {
        return notFound(res, 'Maintenance task not found');
      }

      return success(res, { task }, 'Maintenance task retrieved successfully');
    } catch (error) {
      logger.error(`Error in getTaskById for task ${req.params.id}:`, error);
      return serverError(res, 'Failed to retrieve maintenance task');
    }
  },

  /**
   * Create a new maintenance task
   */
  async createTask(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      logger.debug(`Creating maintenance task for user ID: ${userId}`);
      
      if (!userId) {
        logger.error('User ID is missing in request');
        return badRequest(res, 'User not authenticated');
      }

      const { title, description, dueDate, frequency, category, priority, notes } = req.body;
      logger.debug('Task data received:', { title, dueDate, category, priority });

      // Validate required fields
      if (!title) {
        logger.error('Task title is missing');
        return badRequest(res, 'Task title is required');
      }

      // Create the task with error handling
      try {
        // Format the data properly
        const taskData = {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          frequency,
          category,
          priority,
          notes,
          userId,
        };
        
        logger.debug('Creating task with data:', taskData);
        
        const task = await maintenanceService.createTask(taskData);
        logger.debug('Task created successfully:', task);
        
        return success(res, { task }, 'Maintenance task created successfully');
      } catch (dbError) {
        logger.error('Database error creating task:', dbError);
        return serverError(res, 'Database error creating maintenance task');
      }
    } catch (error) {
      logger.error('Error in createTask:', error);
      return serverError(res, 'Failed to create maintenance task');
    }
  },

  /**
   * Update an existing maintenance task
   */
  async updateTask(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      if (!id) {
        return badRequest(res, 'Task ID is required');
      }

      // Check if task exists
      const existingTask = await maintenanceService.getTaskById(id, userId);
      if (!existingTask) {
        return notFound(res, 'Maintenance task not found');
      }

      const { title, description, dueDate, completedDate, frequency, category, priority, notes } = req.body;

      // Update the task
      const updatedTask = await maintenanceService.updateTask(id, userId, {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : completedDate === null ? null : undefined,
        frequency,
        category,
        priority,
        notes,
      });

      return success(res, { task: updatedTask }, 'Maintenance task updated successfully');
    } catch (error) {
      logger.error(`Error in updateTask for task ${req.params.id}:`, error);
      return serverError(res, 'Failed to update maintenance task');
    }
  },

  /**
   * Delete a maintenance task
   */
  async deleteTask(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      if (!id) {
        return badRequest(res, 'Task ID is required');
      }

      // Check if task exists
      const existingTask = await maintenanceService.getTaskById(id, userId);
      if (!existingTask) {
        return notFound(res, 'Maintenance task not found');
      }

      // Delete the task
      await maintenanceService.deleteTask(id, userId);

      return success(res, null, 'Maintenance task deleted successfully');
    } catch (error) {
      logger.error(`Error in deleteTask for task ${req.params.id}:`, error);
      return serverError(res, 'Failed to delete maintenance task');
    }
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      if (!id) {
        return badRequest(res, 'Task ID is required');
      }

      const { isComplete } = req.body;
      if (isComplete === undefined) {
        return badRequest(res, 'isComplete status is required');
      }

      // Check if task exists
      const existingTask = await maintenanceService.getTaskById(id, userId);
      if (!existingTask) {
        return notFound(res, 'Maintenance task not found');
      }

      // Toggle completion status
      const updatedTask = await maintenanceService.toggleTaskCompletion(id, userId, isComplete);

      return success(res, { task: updatedTask }, `Maintenance task marked as ${isComplete ? 'complete' : 'incomplete'}`);
    } catch (error) {
      logger.error(`Error in toggleTaskCompletion for task ${req.params.id}:`, error);
      return serverError(res, 'Failed to update task completion status');
    }
  },

  /**
   * Get overdue maintenance tasks
   */
  async getOverdueTasks(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const tasks = await maintenanceService.getOverdueTasks(userId);
      return success(res, { tasks }, 'Overdue maintenance tasks retrieved successfully');
    } catch (error) {
      logger.error('Error in getOverdueTasks:', error);
      return serverError(res, 'Failed to retrieve overdue maintenance tasks');
    }
  },

  /**
   * Get upcoming maintenance tasks
   */
  async getUpcomingTasks(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      const tasks = await maintenanceService.getUpcomingTasks(userId, days);
      return success(res, { tasks }, `Upcoming maintenance tasks for next ${days} days retrieved successfully`);
    } catch (error) {
      logger.error('Error in getUpcomingTasks:', error);
      return serverError(res, 'Failed to retrieve upcoming maintenance tasks');
    }
  },
};

export default maintenanceController;
