/**
 * Plant Service
 *
 * Service for handling plant-related database operations
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import { Plant } from '@prisma/client';

// Define PlantCareLog type since it's not yet available in the Prisma client
interface PlantCareLog {
  id: string;
  careType: string;
  date: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  plantId: string;
}

/**
 * Plant service class
 */
class PlantService {
  /**
   * Get all plants for a user
   */
  async getPlants(userId: string): Promise<Plant[]> {
    try {
      return await prisma.plant.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error fetching plants:', error);
      throw error;
    }
  }

  /**
   * Get a single plant by ID
   */
  async getPlant(plantId: string, userId: string): Promise<Plant | null> {
    try {
      return await prisma.plant.findFirst({
        where: {
          id: plantId,
          userId
        }
      });
    } catch (error) {
      logger.error(`Error fetching plant with ID ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new plant
   */
  async createPlant(plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Plant> {
    try {
      return await prisma.plant.create({
        data: {
          ...plantData,
          userId
        }
      });
    } catch (error) {
      logger.error('Error creating plant:', error);
      throw error;
    }
  }

  /**
   * Update an existing plant
   */
  async updatePlant(plantId: string, plantData: Partial<Plant>, userId: string): Promise<Plant> {
    try {
      return await prisma.plant.update({
        where: {
          id: plantId,
          userId
        },
        data: plantData
      });
    } catch (error) {
      logger.error(`Error updating plant with ID ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a plant
   */
  async deletePlant(plantId: string, userId: string): Promise<Plant> {
    try {
      // Delete associated care logs first using raw SQL
      await prisma.$executeRaw`DELETE FROM "public"."PlantCareLog" WHERE "plantId" = ${plantId}`;
      
      // Then delete the plant
      return await prisma.plant.delete({
        where: {
          id: plantId,
          userId
        }
      });
    } catch (error) {
      logger.error(`Error deleting plant with ID ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get plants that need care soon
   */
  async getPlantsNeedingCare(userId: string, beforeDate: Date): Promise<Plant[]> {
    try {
      return await prisma.plant.findMany({
        where: {
          userId,
          OR: [
            {
              nextWatering: {
                lte: beforeDate
              }
            },
            {
              nextFertilizing: {
                lte: beforeDate
              }
            }
          ]
        },
        orderBy: [
          { nextWatering: 'asc' },
          { nextFertilizing: 'asc' }
        ]
      });
    } catch (error) {
      logger.error('Error fetching plants needing care:', error);
      throw error;
    }
  }

  /**
   * Log plant care activity
   */
  async logCare(plantId: string, careData: Omit<PlantCareLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    try {
      // Use the correct model name based on the Prisma schema
      const id = `cl_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const result = await prisma.$executeRaw`
        INSERT INTO "public"."PlantCareLog" ("id", "careType", "date", "notes", "createdAt", "updatedAt", "plantId")
        VALUES (
          ${id},
          ${careData.careType},
          ${careData.date},
          ${careData.notes || null},
          ${new Date()},
          ${new Date()},
          ${plantId}
        )
      `;
      
      // Return a mock care log object since we can't easily get the inserted record
      return {
        id,
        careType: careData.careType,
        date: careData.date,
        notes: careData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        plantId
      };
    } catch (error) {
      logger.error(`Error logging care for plant with ID ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get care logs for a plant
   */
  async getCareLogs(plantId: string): Promise<any[]> {
    try {
      // Use the correct model name based on the Prisma schema
      const careLogs = await prisma.$queryRaw`
        SELECT * FROM "public"."PlantCareLog"
        WHERE "plantId" = ${plantId}
        ORDER BY "date" DESC
      `;
      
      // If no care logs exist yet, return an empty array
      if (!careLogs || !Array.isArray(careLogs)) {
        return [];
      }
      
      return careLogs;
    } catch (error) {
      logger.error(`Error fetching care logs for plant with ID ${plantId}:`, error);
      // Return an empty array instead of throwing an error
      return [];
    }
  }
}

export default new PlantService();
