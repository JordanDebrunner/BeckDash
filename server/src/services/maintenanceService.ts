/**
 * Maintenance Service
 *
 * Handles business logic for maintenance tasks
 */

import { PrismaClient, MaintenanceTask } from '@prisma/client';
import logger from '../utils/logger';

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
  async getAllTasks(userId: string): Promise<MaintenanceTask[]> {
    try {
      logger.debug(`Getting all maintenance tasks for user ${userId}`);
      return await prisma.maintenanceTask.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' },
      });
    } catch (error) {
      logger.error('Error getting maintenance tasks:', error);
      throw error;
    }
  },

  /**
   * Get a single maintenance task by ID
   */
  async getTaskById(id: string, userId: string): Promise<MaintenanceTask | null> {
    try {
      logger.debug(`Getting maintenance task ${id} for user ${userId}`);
      return await prisma.maintenanceTask.findFirst({
        where: { 
          id,
          userId 
        },
      });
    } catch (error) {
      logger.error(`Error getting maintenance task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new maintenance task
   */
  async createTask(data: CreateMaintenanceTaskInput): Promise<MaintenanceTask> {
    try {
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
    } catch (error) {
      logger.error('Error creating maintenance task:', error);
      // Rethrow with more context
      throw new Error(`Failed to create maintenance task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Update an existing maintenance task
   */
  async updateTask(id: string, userId: string, data: UpdateMaintenanceTaskInput): Promise<MaintenanceTask> {
    try {
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
        throw new Error(`Task ${id} not found`);
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
    } catch (error) {
      logger.error(`Error updating maintenance task ${id}:`, error);
      throw new Error(`Failed to update maintenance task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete a maintenance task
   */
  async deleteTask(id: string, userId: string): Promise<MaintenanceTask> {
    try {
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
        throw new Error(`Task ${id} not found`);
      }
      
      // Delete the task
      return await prisma.maintenanceTask.delete({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error deleting maintenance task ${id}:`, error);
      throw new Error(`Failed to delete maintenance task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Mark a task as complete or incomplete
   */
  async toggleTaskCompletion(id: string, userId: string, isComplete: boolean): Promise<MaintenanceTask> {
    try {
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
        throw new Error(`Task ${id} not found`);
      }
      
      // Update the task
      return await prisma.maintenanceTask.update({
        where: { id },
        data: {
          completedDate: isComplete ? new Date() : null,
          userId: userId // Ensure the task is associated with the correct user
        },
      });
    } catch (error) {
      logger.error(`Error toggling completion for task ${id}:`, error);
      throw new Error(`Failed to toggle task completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get overdue maintenance tasks
   */
  async getOverdueTasks(userId: string): Promise<MaintenanceTask[]> {
    try {
      const now = new Date();
      return await prisma.maintenanceTask.findMany({
        where: {
          userId,
          dueDate: { lt: now },
          completedDate: null,
        },
        orderBy: { dueDate: 'asc' },
      });
    } catch (error) {
      logger.error('Error getting overdue maintenance tasks:', error);
      throw error;
    }
  },

  /**
   * Get upcoming maintenance tasks due in the next X days
   */
  async getUpcomingTasks(userId: string, days: number = 7): Promise<MaintenanceTask[]> {
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);

      return await prisma.maintenanceTask.findMany({
        where: {
          userId,
          dueDate: {
            gte: now,
            lte: future,
          },
          completedDate: null,
        },
        orderBy: { dueDate: 'asc' },
      });
    } catch (error) {
      logger.error(`Error getting upcoming maintenance tasks for next ${days} days:`, error);
      throw error;
    }
  },
};

export default maintenanceService;
