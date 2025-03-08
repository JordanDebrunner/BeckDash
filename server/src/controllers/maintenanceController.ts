/**
 * Maintenance Controller
 *
 * Handles HTTP requests related to maintenance tasks
 */

import { Request, Response } from 'express';
import { success, badRequest, notFound, serverError } from '../utils/responseFormatter';
import maintenanceService from '../services/maintenanceService';
import { RequestWithUser } from '../types/request.types';
import logger from '../utils/logger';
import { withControllerErrorHandling, validateRequired, validateExists } from '../utils/errorHandler';

// Maintenance controller methods
const maintenanceController = {
  /**
   * Get all maintenance tasks for the authenticated user
   */
  getAllTasks: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
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
    },
    'maintenanceController.getAllTasks'
  ),

  /**
   * Get a single maintenance task by ID
   */
  getTaskById: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
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
    },
    'maintenanceController.getTaskById'
  ),

  /**
   * Create a new maintenance task
   */
  createTask: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
      const userId = req.userId;
      logger.debug(`Creating maintenance task for user ID: ${userId}`);
      
      if (!userId) {
        logger.error('User ID is missing in request');
        return badRequest(res, 'User not authenticated');
      }

      const { title, description, dueDate, frequency, category, priority, notes } = req.body;
      logger.debug('Task data received:', { title, dueDate, category, priority });

      // Validate required fields
      validateRequired(title, 'Task title');

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
    },
    'maintenanceController.createTask'
  ),

  /**
   * Update an existing maintenance task
   */
  updateTask: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      validateRequired(id, 'Task ID');

      // Check if task exists
      const existingTask = await maintenanceService.getTaskById(id, userId);
      validateExists(existingTask, 'Maintenance task');

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
    },
    'maintenanceController.updateTask'
  ),

  /**
   * Delete a maintenance task
   */
  deleteTask: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      validateRequired(id, 'Task ID');

      // Check if task exists
      const existingTask = await maintenanceService.getTaskById(id, userId);
      validateExists(existingTask, 'Maintenance task');

      // Delete the task
      await maintenanceService.deleteTask(id, userId);

      return success(res, null, 'Maintenance task deleted successfully');
    },
    'maintenanceController.deleteTask'
  ),

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const { id } = req.params;
      validateRequired(id, 'Task ID');

      const { isComplete } = req.body;
      if (isComplete === undefined) {
        return badRequest(res, 'isComplete status is required');
      }

      // Check if task exists
      const existingTask = await maintenanceService.getTaskById(id, userId);
      validateExists(existingTask, 'Maintenance task');

      // Toggle completion status
      const updatedTask = await maintenanceService.toggleTaskCompletion(id, userId, isComplete);

      return success(res, { task: updatedTask }, `Maintenance task marked as ${isComplete ? 'complete' : 'incomplete'}`);
    },
    'maintenanceController.toggleTaskCompletion'
  ),

  /**
   * Get overdue maintenance tasks
   */
  getOverdueTasks: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const tasks = await maintenanceService.getOverdueTasks(userId);
      return success(res, { tasks }, 'Overdue maintenance tasks retrieved successfully');
    },
    'maintenanceController.getOverdueTasks'
  ),

  /**
   * Get upcoming maintenance tasks
   */
  getUpcomingTasks: withControllerErrorHandling(
    async (req: RequestWithUser, res: Response): Promise<Response> => {
      const userId = req.userId;
      if (!userId) {
        return badRequest(res, 'User not authenticated');
      }

      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      
      const tasks = await maintenanceService.getUpcomingTasks(userId, days);
      return success(res, { tasks }, `Upcoming maintenance tasks for next ${days} days retrieved successfully`);
    },
    'maintenanceController.getUpcomingTasks'
  ),
};

export default maintenanceController;
