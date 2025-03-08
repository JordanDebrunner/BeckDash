/**
 * Maintenance Service
 *
 * Handles API requests related to maintenance tasks
 */

import { 
  MaintenanceTask, 
  CreateMaintenanceTaskInput, 
  UpdateMaintenanceTaskInput,
  MaintenanceTasksResponse,
  MaintenanceTaskResponse,
  ToggleTaskCompletionInput
} from '../../../shared/types/maintenance.types';
import { ApiResponse } from '../../../shared/types/api.types';
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete 
} from '../utils/apiUtils';

// Base URL for API requests
const API_BASE_URL = '/api/v1';

// Maintenance service
const maintenanceService = {
  /**
   * Get all maintenance tasks
   */
  async getAllTasks(): Promise<MaintenanceTask[]> {
    try {
      console.log('Fetching all maintenance tasks');
      
      const response = await apiGet<MaintenanceTasksResponse>(`${API_BASE_URL}/maintenance`);
      return response.tasks || [];
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      return [];
    }
  },

  /**
   * Get a single maintenance task by ID
   */
  async getTaskById(id: string): Promise<MaintenanceTask | null> {
    try {
      const response = await apiGet<MaintenanceTaskResponse>(`${API_BASE_URL}/maintenance/${id}`);
      return response.task;
    } catch (error) {
      console.error(`Error in getTaskById for task ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new maintenance task
   */
  async createTask(task: CreateMaintenanceTaskInput): Promise<MaintenanceTask> {
    try {
      const response = await apiPost<MaintenanceTaskResponse>(`${API_BASE_URL}/maintenance`, task);
      return response.task;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  },

  /**
   * Update an existing maintenance task
   */
  async updateTask(id: string, task: UpdateMaintenanceTaskInput): Promise<MaintenanceTask> {
    try {
      console.log(`Updating maintenance task ${id} with data:`, task);
      
      const response = await apiPut<MaintenanceTaskResponse>(`${API_BASE_URL}/maintenance/${id}`, task);
      return response.task;
    } catch (error) {
      console.error(`Error in updateTask for task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a maintenance task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await apiDelete<void>(`${API_BASE_URL}/maintenance/${id}`);
    } catch (error) {
      console.error(`Error in deleteTask for task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string, isComplete: boolean): Promise<MaintenanceTask> {
    try {
      const toggleData: ToggleTaskCompletionInput = { isComplete };
      
      const response = await apiPut<MaintenanceTaskResponse>(
        `${API_BASE_URL}/maintenance/${id}/toggle-completion`, 
        toggleData
      );
      return response.task;
    } catch (error) {
      console.error(`Error in toggleTaskCompletion for task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get overdue maintenance tasks
   */
  async getOverdueTasks(): Promise<MaintenanceTask[]> {
    try {
      const response = await apiGet<MaintenanceTasksResponse>(`${API_BASE_URL}/maintenance/status/overdue`);
      return response.tasks || [];
    } catch (error) {
      console.error('Error in getOverdueTasks:', error);
      return [];
    }
  },

  /**
   * Get upcoming maintenance tasks
   */
  async getUpcomingTasks(): Promise<MaintenanceTask[]> {
    try {
      const response = await apiGet<MaintenanceTasksResponse>(`${API_BASE_URL}/maintenance/status/upcoming`);
      return response.tasks || [];
    } catch (error) {
      console.error('Error in getUpcomingTasks:', error);
      return [];
    }
  }
};

export default maintenanceService; 