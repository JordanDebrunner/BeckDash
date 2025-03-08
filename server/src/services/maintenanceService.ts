/**
 * Maintenance Service
 *
 * Handles business logic for maintenance tasks
 */

import { PrismaClient, MaintenanceTask } from '@prisma/client';
import logger from '../utils/logger';
import { withServiceErrorHandling, AppError, ErrorTypes, validateExists } from '../utils/errorHandler';

const prisma = new PrismaClient();

// Types for maintenance task operations
type CreateMaintenanceTaskInput = {
  title: string;
  description?: string;
  dueDate?: Date;
  frequency?: string;
  category?: string;
  priority?: string;
  notes?: string;
  userId: string;
};

type UpdateMaintenanceTaskInput = Partial<CreateMaintenanceTaskInput> & {
  completedDate?: Date | null;
};

// Maintenance service methods
const maintenanceService = {
  /**
   * Get all maintenance tasks for a user
   */
  getAllTasks: withServiceErrorHandling(
    async (userId: string): Promise<MaintenanceTask[]> => {
      logger.debug(`Getting all maintenance tasks for user ${userId}`);
      return await prisma.maintenanceTask.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' },
      });
    },
    'maintenanceService.getAllTasks'
  ),

  /**
   * Get a single maintenance task by ID
   */
  getTaskById: withServiceErrorHandling(
    async (id: string, userId: string): Promise<MaintenanceTask | null> => {
      logger.debug(`Getting maintenance task ${id} for user ${userId}`);
      return await prisma.maintenanceTask.findFirst({
        where: { 
          id,
          userId 
        },
      });
    },
    'maintenanceService.getTaskById'
  ),

  /**
   * Create a new maintenance task
   */
  createTask: withServiceErrorHandling(
    async (data: CreateMaintenanceTaskInput): Promise<MaintenanceTask> => {
      logger.debug(`Creating maintenance task for user ${data.userId}`);
      
      // Check if the user exists
      let userId = data.userId;
      let user = null;
      
      try {
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
      } catch (error) {
        logger.error('Error finding user:', error);
      }
      
      // If user doesn't exist, create a default user
      if (!user) {
        logger.debug(`User ${userId} not found, creating default user`);
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: 'dev@example.com',
              password: 'hashedpassword',
              firstName: 'Dev',
              lastName: 'User'
            }
          });
          logger.debug('Created default user:', user);
        } catch (error) {
          logger.error('Error creating default user:', error);
          // If we can't create the user, use a different approach
          if ((error as any).code === 'P2002') {
            // User with this email already exists, try to find by email
            user = await prisma.user.findUnique({
              where: { email: 'dev@example.com' }
            });
            if (user) {
              userId = user.id;
              logger.debug('Using existing user with ID:', userId);
            }
          }
        }
      }
      
      // Format the data for database insertion
      const formattedData = {
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate || null,
        frequency: data.frequency || null,
        category: data.category || null,
        priority: data.priority || null,
        notes: data.notes || null,
        userId: userId
      };
      
      logger.debug('Formatted task data:', formattedData);
      
      // Create the task with the user ID
      const result = await prisma.maintenanceTask.create({
        data: formattedData,
      });
      
      logger.debug('Task created successfully:', result);
      return result;
    },
    'maintenanceService.createTask'
  ),

  /**
   * Update an existing maintenance task
   */
  updateTask: withServiceErrorHandling(
    async (id: string, userId: string, data: UpdateMaintenanceTaskInput): Promise<MaintenanceTask> => {
      logger.debug(`Updating maintenance task ${id} for user ${userId}`);
      
      // Check if the user exists
      let user = null;
      
      try {
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
      } catch (error) {
        logger.error('Error finding user:', error);
      }
      
      // If user doesn't exist, create a default user
      if (!user) {
        logger.debug(`User ${userId} not found, creating default user`);
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: 'dev@example.com',
              password: 'hashedpassword',
              firstName: 'Dev',
              lastName: 'User'
            }
          });
          logger.debug('Created default user:', user);
        } catch (error) {
          logger.error('Error creating default user:', error);
          // If we can't create the user, use a different approach
          if ((error as any).code === 'P2002') {
            // User with this email already exists, try to find by email
            user = await prisma.user.findUnique({
              where: { email: 'dev@example.com' }
            });
            if (user) {
              userId = user.id;
              logger.debug('Using existing user with ID:', userId);
            }
          }
        }
      }
      
      // First check if the task exists
      const existingTask = await prisma.maintenanceTask.findFirst({
        where: { id }
      });
      
      if (!existingTask) {
        throw new AppError(`Task ${id} not found`, 404, ErrorTypes.NOT_FOUND);
      }
      
      // Update the task
      return await prisma.maintenanceTask.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          completedDate: data.completedDate,
          frequency: data.frequency,
          category: data.category,
          priority: data.priority,
          notes: data.notes,
          userId: userId // Ensure the task is associated with the correct user
        },
      });
    },
    'maintenanceService.updateTask'
  ),

  /**
   * Delete a maintenance task
   */
  deleteTask: withServiceErrorHandling(
    async (id: string, userId: string): Promise<MaintenanceTask> => {
      logger.debug(`Deleting maintenance task ${id} for user ${userId}`);
      
      // Check if the user exists
      let user = null;
      
      try {
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
      } catch (error) {
        logger.error('Error finding user:', error);
      }
      
      // If user doesn't exist, create a default user
      if (!user) {
        logger.debug(`User ${userId} not found, creating default user`);
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: 'dev@example.com',
              password: 'hashedpassword',
              firstName: 'Dev',
              lastName: 'User'
            }
          });
          logger.debug('Created default user:', user);
        } catch (error) {
          logger.error('Error creating default user:', error);
          // If we can't create the user, use a different approach
          if ((error as any).code === 'P2002') {
            // User with this email already exists, try to find by email
            user = await prisma.user.findUnique({
              where: { email: 'dev@example.com' }
            });
            if (user) {
              userId = user.id;
              logger.debug('Using existing user with ID:', userId);
            }
          }
        }
      }
      
      // First check if the task exists
      const existingTask = await prisma.maintenanceTask.findFirst({
        where: { id }
      });
      
      if (!existingTask) {
        throw new AppError(`Task ${id} not found`, 404, ErrorTypes.NOT_FOUND);
      }
      
      // Delete the task
      return await prisma.maintenanceTask.delete({
        where: { id },
      });
    },
    'maintenanceService.deleteTask'
  ),

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion: withServiceErrorHandling(
    async (id: string, userId: string, isComplete: boolean): Promise<MaintenanceTask> => {
      logger.debug(`Toggling completion for task ${id} for user ${userId} to ${isComplete}`);
      
      // Check if the user exists
      let user = null;
      
      try {
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
      } catch (error) {
        logger.error('Error finding user:', error);
      }
      
      // If user doesn't exist, create a default user
      if (!user) {
        logger.debug(`User ${userId} not found, creating default user`);
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: 'dev@example.com',
              password: 'hashedpassword',
              firstName: 'Dev',
              lastName: 'User'
            }
          });
          logger.debug('Created default user:', user);
        } catch (error) {
          logger.error('Error creating default user:', error);
          // If we can't create the user, use a different approach
          if ((error as any).code === 'P2002') {
            // User with this email already exists, try to find by email
            user = await prisma.user.findUnique({
              where: { email: 'dev@example.com' }
            });
            if (user) {
              userId = user.id;
              logger.debug('Using existing user with ID:', userId);
            }
          }
        }
      }
      
      // First check if the task exists
      const existingTask = await prisma.maintenanceTask.findFirst({
        where: { id }
      });
      
      if (!existingTask) {
        throw new AppError(`Task ${id} not found`, 404, ErrorTypes.NOT_FOUND);
      }
      
      // Update the task
      return await prisma.maintenanceTask.update({
        where: { id },
        data: {
          completedDate: isComplete ? new Date() : null,
          userId: userId // Ensure the task is associated with the correct user
        },
      });
    },
    'maintenanceService.toggleTaskCompletion'
  ),

  /**
   * Get overdue maintenance tasks
   */
  getOverdueTasks: withServiceErrorHandling(
    async (userId: string): Promise<MaintenanceTask[]> => {
      logger.debug(`Getting overdue tasks for user ${userId}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return await prisma.maintenanceTask.findMany({
        where: {
          userId,
          dueDate: {
            lt: today
          },
          completedDate: null
        },
        orderBy: {
          dueDate: 'asc'
        }
      });
    },
    'maintenanceService.getOverdueTasks'
  ),

  /**
   * Get upcoming maintenance tasks
   */
  getUpcomingTasks: withServiceErrorHandling(
    async (userId: string, days: number = 7): Promise<MaintenanceTask[]> => {
      logger.debug(`Getting upcoming tasks for user ${userId} for next ${days} days`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);
      
      return await prisma.maintenanceTask.findMany({
        where: {
          userId,
          dueDate: {
            gte: today,
            lte: futureDate
          },
          completedDate: null
        },
        orderBy: {
          dueDate: 'asc'
        }
      });
    },
    'maintenanceService.getUpcomingTasks'
  )
};

export default maintenanceService;
