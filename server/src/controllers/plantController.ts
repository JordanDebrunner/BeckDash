/**
 * Plant Controller
 *
 * Handles HTTP requests related to plants
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { badRequest, created, notFound, success, serverError } from '../utils/responseFormatter';
import logger from '../utils/logger';
import { RequestWithUser } from '../types/RequestWithUser';
import plantService from '../services/plantService';

// Validation schemas
const plantSchema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  species: z.string().optional(),
  image: z.string().optional(),
  wateringSchedule: z.string().optional(),
  wateringAmount: z.string().optional(),
  lastWatered: z.string().datetime().optional(),
  nextWatering: z.string().datetime().optional(),
  fertilizeSchedule: z.string().optional(),
  lastFertilized: z.string().datetime().optional(),
  nextFertilizing: z.string().datetime().optional(),
  location: z.string().optional(),
  lightNeeds: z.string().optional(),
  notes: z.string().optional(),
  healthStatus: z.string().optional(),
});

const careLogSchema = z.object({
  careType: z.enum(['watering', 'fertilizing', 'pruning', 'repotting', 'other']),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

/**
 * Plant controller
 */
const plantController = {
  /**
   * Get all plants for the authenticated user
   */
  getPlants: async (req: RequestWithUser, res: Response) => {
    try {
      const plants = await plantService.getPlants(req.userId!);
      return success(res, { plants });
    } catch (error) {
      logger.error('Error fetching plants:', error);
      return serverError(res, 'Failed to fetch plants');
    }
  },

  /**
   * Get a single plant by ID
   */
  getPlant: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      const plant = await plantService.getPlant(id, req.userId!);
      
      if (!plant) {
        return notFound(res, 'Plant not found');
      }
      
      return success(res, { plant });
    } catch (error) {
      logger.error(`Error fetching plant with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to fetch plant');
    }
  },

  /**
   * Create a new plant
   */
  createPlant: async (req: RequestWithUser, res: Response) => {
    try {
      const validationResult = plantSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return badRequest(res, 'Invalid plant data', validationResult.error.errors);
      }
      
      const plantData = validationResult.data;
      
      // Convert string dates to Date objects or null
      const lastWatered = plantData.lastWatered ? new Date(plantData.lastWatered) : null;
      const nextWatering = plantData.nextWatering ? new Date(plantData.nextWatering) : null;
      const lastFertilized = plantData.lastFertilized ? new Date(plantData.lastFertilized) : null;
      const nextFertilizing = plantData.nextFertilizing ? new Date(plantData.nextFertilizing) : null;
      
      const plant = await plantService.createPlant({
        ...plantData,
        lastWatered,
        nextWatering,
        lastFertilized,
        nextFertilizing
      }, req.userId!);
      
      return created(res, { plant });
    } catch (error) {
      logger.error('Error creating plant:', error);
      return serverError(res, 'Failed to create plant');
    }
  },

  /**
   * Update an existing plant
   */
  updatePlant: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      const validationResult = plantSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return badRequest(res, 'Invalid plant data', validationResult.error.errors);
      }
      
      // Check if plant exists and belongs to user
      const existingPlant = await plantService.getPlant(id, req.userId!);
      if (!existingPlant) {
        return notFound(res, 'Plant not found');
      }
      
      const plantData = validationResult.data;
      
      // Convert string dates to Date objects or null
      const lastWatered = plantData.lastWatered ? new Date(plantData.lastWatered) : null;
      const nextWatering = plantData.nextWatering ? new Date(plantData.nextWatering) : null;
      const lastFertilized = plantData.lastFertilized ? new Date(plantData.lastFertilized) : null;
      const nextFertilizing = plantData.nextFertilizing ? new Date(plantData.nextFertilizing) : null;
      
      const updatedPlant = await plantService.updatePlant(id, {
        ...plantData,
        lastWatered,
        nextWatering,
        lastFertilized,
        nextFertilizing
      }, req.userId!);
      
      return success(res, { plant: updatedPlant });
    } catch (error) {
      logger.error(`Error updating plant with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to update plant');
    }
  },

  /**
   * Delete a plant
   */
  deletePlant: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if plant exists and belongs to user
      const existingPlant = await plantService.getPlant(id, req.userId!);
      if (!existingPlant) {
        return notFound(res, 'Plant not found');
      }
      
      await plantService.deletePlant(id, req.userId!);
      
      return success(res, { message: 'Plant deleted successfully' });
    } catch (error) {
      logger.error(`Error deleting plant with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to delete plant');
    }
  },

  /**
   * Get plants that need care soon
   */
  getPlantsNeedingCare: async (req: RequestWithUser, res: Response) => {
    try {
      const beforeDate = req.query.before 
        ? new Date(req.query.before as string) 
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Default to 3 days from now
      
      const plants = await plantService.getPlantsNeedingCare(req.userId!, beforeDate);
      
      return success(res, { plants });
    } catch (error) {
      logger.error('Error fetching plants needing care:', error);
      return serverError(res, 'Failed to fetch plants needing care');
    }
  },

  /**
   * Log care for a plant
   */
  logCare: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      const validationResult = careLogSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return badRequest(res, 'Invalid care log data', validationResult.error.errors);
      }
      
      // Check if plant exists and belongs to user
      const existingPlant = await plantService.getPlant(id, req.userId!);
      if (!existingPlant) {
        return notFound(res, 'Plant not found');
      }
      
      const careData = validationResult.data;
      const careLog = await plantService.logCare(id, {
        ...careData,
        date: new Date(careData.date)
      });
      
      // Update plant's last watered/fertilized date if applicable
      if (careData.careType === 'watering') {
        const nextWatering = calculateNextCareDate(careData.date, existingPlant.wateringSchedule);
        await plantService.updatePlant(id, { 
          lastWatered: new Date(careData.date),
          nextWatering
        }, req.userId!);
      } else if (careData.careType === 'fertilizing') {
        const nextFertilizing = calculateNextCareDate(careData.date, existingPlant.fertilizeSchedule);
        await plantService.updatePlant(id, { 
          lastFertilized: new Date(careData.date),
          nextFertilizing
        }, req.userId!);
      }
      
      return created(res, { careLog });
    } catch (error) {
      logger.error(`Error logging care for plant with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to log plant care');
    }
  },

  /**
   * Get care logs for a plant
   */
  getCareLogs: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if plant exists and belongs to user
      const existingPlant = await plantService.getPlant(id, req.userId!);
      if (!existingPlant) {
        return notFound(res, 'Plant not found');
      }
      
      const careLogs = await plantService.getCareLogs(id);
      
      return success(res, { careLogs });
    } catch (error) {
      logger.error(`Error fetching care logs for plant with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to fetch plant care logs');
    }
  }
};

/**
 * Calculate the next care date based on the schedule
 */
function calculateNextCareDate(currentDateStr: string, schedule?: string | null): Date | undefined {
  if (!schedule) return undefined;
  
  const currentDate = new Date(currentDateStr);
  
  // Parse schedule string to determine next date
  if (schedule.includes('day')) {
    const days = parseInt(schedule.match(/\d+/)?.[0] || '7');
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  } else if (schedule.includes('week')) {
    const weeks = parseInt(schedule.match(/\d+/)?.[0] || '1');
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + (weeks * 7));
    return nextDate;
  } else if (schedule.includes('month')) {
    const months = parseInt(schedule.match(/\d+/)?.[0] || '1');
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }
  
  // Default to 1 week if schedule format is not recognized
  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 7);
  return nextDate;
}

export default plantController;
