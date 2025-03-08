/**
 * Plant Service
 *
 * Service for managing plants and plant care in the application
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiUtils';
import calendarService from './calendar.service';
import { EventCategory } from '../types/Event';
import axios from 'axios';

// API base URL
const API_BASE_URL = '/api/v1';

// Plant type definitions
export interface Plant {
  id: string;
  name: string;
  species?: string;
  image?: string;
  wateringSchedule?: string;
  wateringAmount?: string;
  lastWatered?: string;
  nextWatering?: string;
  fertilizeSchedule?: string;
  lastFertilized?: string;
  nextFertilizing?: string;
  location?: string;
  lightNeeds?: string;
  notes?: string;
  healthStatus?: 'Healthy' | 'Needs Attention' | 'Danger';
  createdAt: string;
  updatedAt: string;
}

export interface PlantCareLog {
  id: string;
  plantId: string;
  careType: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'other';
  date: string;
  notes?: string;
}

/**
 * Plant service class
 */
class PlantService {
  private readonly baseUrl = `${API_BASE_URL}/plants`;

  /**
   * Get all plants
   */
  async getPlants(): Promise<Plant[]> {
    try {
      console.log('PlantService: Fetching plants');
      
      const response = await apiGet<{ plants: Plant[] }>(this.baseUrl);
      return response.plants || [];
    } catch (error) {
      console.error('Error fetching plants:', error);
      throw error;
    }
  }

  /**
   * Get a single plant by ID
   */
  async getPlant(id: string): Promise<Plant> {
    try {
      const response = await apiGet<{ plant: Plant }>(`${this.baseUrl}/${id}`);
      return response.plant;
    } catch (error) {
      console.error(`Error fetching plant with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new plant
   */
  async createPlant(plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
    try {
      const response = await apiPost<{ plant: Plant }>(this.baseUrl, plantData);
      
      // Create calendar events for plant care if schedules are provided
      if (plantData.wateringSchedule) {
        await this.createWateringSchedule(response.plant);
      }
      
      if (plantData.fertilizeSchedule) {
        await this.createFertilizingSchedule(response.plant);
      }
      
      return response.plant;
    } catch (error) {
      console.error('Error creating plant:', error);
      throw error;
    }
  }

  /**
   * Update an existing plant
   */
  async updatePlant(id: string, plantData: Partial<Plant>): Promise<Plant> {
    try {
      const response = await apiPut<{ plant: Plant }>(`${this.baseUrl}/${id}`, plantData);
      
      // Update calendar events for plant care if schedules are updated
      if (plantData.wateringSchedule) {
        await this.updateWateringSchedule(response.plant);
      }
      
      if (plantData.fertilizeSchedule) {
        await this.updateFertilizingSchedule(response.plant);
      }
      
      return response.plant;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  }

  /**
   * Delete a plant
   */
  async deletePlant(id: string): Promise<void> {
    try {
      await apiDelete(`${this.baseUrl}/${id}`);
      
      // Delete associated calendar events
      await this.deleteAllPlantCareEvents(id);
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  }

  /**
   * Log plant care activity
   */
  async logCare(plantId: string, careData: Omit<PlantCareLog, 'id'>): Promise<PlantCareLog> {
    try {
      const response = await apiPost<{ careLog: PlantCareLog }>(
        `${this.baseUrl}/${plantId}/care-logs`, 
        careData
      );
      
      // Update last watered/fertilized dates if applicable
      if (careData.careType === 'watering') {
        await this.updatePlant(plantId, { 
          lastWatered: careData.date,
          // Calculate next watering date based on schedule
          nextWatering: this.calculateNextCareDate(careData.date, await this.getPlantWateringInterval(plantId))
        });
      } else if (careData.careType === 'fertilizing') {
        await this.updatePlant(plantId, { 
          lastFertilized: careData.date,
          // Calculate next fertilizing date based on schedule
          nextFertilizing: this.calculateNextCareDate(careData.date, await this.getPlantFertilizingInterval(plantId))
        });
      }
      
      return response.careLog;
    } catch (error) {
      console.error('Error logging plant care:', error);
      throw error;
    }
  }

  /**
   * Get care logs for a plant
   */
  async getCareLogs(plantId: string): Promise<PlantCareLog[]> {
    try {
      const response = await apiGet<{ careLogs: PlantCareLog[] }>(`${this.baseUrl}/${plantId}/care-logs`);
      return response.careLogs || [];
    } catch (error) {
      console.error(`Error fetching care logs for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get plants that need care soon
   */
  async getPlantsNeedingCare(days: number = 3): Promise<Plant[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + days);
      
      const response = await apiGet<{ plants: Plant[] }>(
        `${this.baseUrl}/needs-care?before=${futureDate.toISOString()}`
      );
      return response.plants || [];
    } catch (error) {
      console.error('Error fetching plants needing care:', error);
      throw error;
    }
  }

  /**
   * Create calendar events for watering schedule
   */
  private async createWateringSchedule(plant: Plant): Promise<void> {
    if (!plant.wateringSchedule) return;
    
    const interval = await this.getPlantWateringInterval(plant.id);
    const startDate = plant.nextWatering || new Date().toISOString();
    
    await calendarService.createEvent({
      title: `Water ${plant.name}`,
      description: `Time to water your ${plant.name}${plant.wateringAmount ? ` with ${plant.wateringAmount}` : ''}`,
      startDate,
      endDate: startDate, // Same day event
      allDay: true,
      category: 'other' as EventCategory,
      color: '#3b82f6', // Blue color for watering
      isRecurring: true,
      recurrence: {
        type: 'daily',
        interval,
        count: 52 // Limit to a year of occurrences
      }
    });
  }

  /**
   * Create calendar events for fertilizing schedule
   */
  private async createFertilizingSchedule(plant: Plant): Promise<void> {
    if (!plant.fertilizeSchedule) return;
    
    const interval = await this.getPlantFertilizingInterval(plant.id);
    const startDate = plant.nextFertilizing || new Date().toISOString();
    
    await calendarService.createEvent({
      title: `Fertilize ${plant.name}`,
      description: `Time to fertilize your ${plant.name}`,
      startDate,
      endDate: startDate, // Same day event
      allDay: true,
      category: 'other' as EventCategory,
      color: '#10b981', // Green color for fertilizing
      isRecurring: true,
      recurrence: {
        type: 'daily',
        interval,
        count: 12 // Limit to a year of occurrences
      }
    });
  }

  /**
   * Update calendar events for watering schedule
   */
  private async updateWateringSchedule(plant: Plant): Promise<void> {
    // Delete existing watering events
    await this.deletePlantCareEvents(plant.id, 'watering');
    
    // Create new watering events
    await this.createWateringSchedule(plant);
  }

  /**
   * Update calendar events for fertilizing schedule
   */
  private async updateFertilizingSchedule(plant: Plant): Promise<void> {
    // Delete existing fertilizing events
    await this.deletePlantCareEvents(plant.id, 'fertilizing');
    
    // Create new fertilizing events
    await this.createFertilizingSchedule(plant);
  }

  /**
   * Delete all calendar events related to a plant
   */
  private async deleteAllPlantCareEvents(plantId: string): Promise<void> {
    // Implementation would depend on how you store the relationship between plants and events
    // This is a simplified approach - in a real implementation, you'd query for events related to this plant
    
    // For now, we'll assume events have the plant ID in their title or description
    const events = await calendarService.getEvents();
    const plantEvents = events.filter(event => 
      (event.title.includes(`Water ${plantId}`) || 
       event.title.includes(`Fertilize ${plantId}`))
    );
    
    for (const event of plantEvents) {
      await calendarService.deleteEvent(event.id);
    }
  }

  /**
   * Delete specific type of plant care events
   */
  private async deletePlantCareEvents(plantId: string, careType: 'watering' | 'fertilizing'): Promise<void> {
    const events = await calendarService.getEvents();
    const typePrefix = careType === 'watering' ? 'Water' : 'Fertilize';
    
    const plantEvents = events.filter(event => 
      event.title.includes(`${typePrefix} ${plantId}`)
    );
    
    for (const event of plantEvents) {
      await calendarService.deleteEvent(event.id);
    }
  }

  /**
   * Calculate next care date based on interval
   */
  private calculateNextCareDate(currentDate: string, intervalDays: number): string {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + intervalDays);
    return date.toISOString();
  }

  /**
   * Parse watering schedule to get interval in days
   */
  private async getPlantWateringInterval(plantId: string): Promise<number> {
    const plant = await this.getPlant(plantId);
    
    if (!plant.wateringSchedule) return 7; // Default to weekly
    
    // Parse schedule like "Every X days"
    const match = plant.wateringSchedule.match(/Every\s+(\d+)\s+days?/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // Handle other formats or defaults
    if (plant.wateringSchedule.toLowerCase().includes('weekly')) return 7;
    if (plant.wateringSchedule.toLowerCase().includes('biweekly')) return 14;
    if (plant.wateringSchedule.toLowerCase().includes('monthly')) return 30;
    
    return 7; // Default to weekly
  }

  /**
   * Parse fertilizing schedule to get interval in days
   */
  private async getPlantFertilizingInterval(plantId: string): Promise<number> {
    const plant = await this.getPlant(plantId);
    
    if (!plant.fertilizeSchedule) return 30; // Default to monthly
    
    // Parse schedule like "Every X months"
    const monthMatch = plant.fertilizeSchedule.match(/Every\s+(\d+)\s+months?/i);
    if (monthMatch && monthMatch[1]) {
      return parseInt(monthMatch[1], 10) * 30; // Approximate month as 30 days
    }
    
    // Handle other formats or defaults
    if (plant.fertilizeSchedule.toLowerCase().includes('weekly')) return 7;
    if (plant.fertilizeSchedule.toLowerCase().includes('biweekly')) return 14;
    if (plant.fertilizeSchedule.toLowerCase().includes('monthly')) return 30;
    if (plant.fertilizeSchedule.toLowerCase().includes('quarterly')) return 90;
    
    return 30; // Default to monthly
  }
}

// Create a singleton instance of the Plant service
const plantService = new PlantService();

export default plantService;
