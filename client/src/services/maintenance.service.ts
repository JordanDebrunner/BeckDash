/**
 * Maintenance Service
 *
 * Handles API requests related to maintenance tasks
 */

import axios from 'axios';
import apiService, { ApiResponse } from './api.service';

// Types
export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  completedDate?: Date | string | null;
  frequency?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateMaintenanceTaskInput {
  title: string;
  description?: string;
  dueDate?: Date | string;
  frequency?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UpdateMaintenanceTaskInput extends Partial<CreateMaintenanceTaskInput> {
  completedDate?: Date | string | null;
}

// Maintenance service
const maintenanceService = {
  /**
   * Get all maintenance tasks
   */
  async getAllTasks(): Promise<MaintenanceTask[]> {
    try {
      console.log('Fetching all maintenance tasks');
      
      // Ensure we have a valid token before making the request
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found for maintenance tasks');
        throw new Error('Authentication required');
      }
      
      // Try direct API request first
      try {
        const directUrl = 'http://localhost:3000/api/v1/maintenance';
        console.log(`Sending direct GET request to ${directUrl}`);
        
        const directResponse = await axios.get(
          directUrl,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Direct API response:', directResponse.data);
        
        if (directResponse.data && directResponse.data.data && directResponse.data.data.tasks) {
          return directResponse.data.data.tasks;
        }
        
        return [];
      } catch (directError) {
        console.error('Direct API request failed:', directError);
        
        // Fall back to the regular API service
        console.log('Falling back to regular API service');
        const response = await apiService.get<ApiResponse<{ tasks: MaintenanceTask[] }>>('/maintenance');
        
        return response.data?.tasks || [];
      }
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      return [];
    }
  },

  /**
   * Get a single maintenance task by ID
   */
  async getTaskById(id: string): Promise<MaintenanceTask> {
    try {
      const response = await apiService.get<ApiResponse<{ task: MaintenanceTask }>>(`/maintenance/${id}`);
      return response.data?.task as MaintenanceTask;
    } catch (error) {
      console.error(`Error in getTaskById for task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new maintenance task
   */
  async createTask(task: CreateMaintenanceTaskInput): Promise<MaintenanceTask> {
    try {
      console.log('Creating maintenance task with data:', task);
      
      // Ensure we have a valid token before making the request
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found for creating maintenance task');
        throw new Error('Authentication required');
      }
      
      // Format the date if it exists
      const formattedTask = {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null
      };
      
      console.log('Formatted task data:', formattedTask);
      
      // Make the API request with direct approach first
      try {
        const directUrl = `http://localhost:3000/api/v1/maintenance`;
        console.log(`Sending direct POST request to ${directUrl}`);
        
        const directResponse = await axios.post(
          directUrl,
          formattedTask,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Direct API response:', directResponse.data);
        
        if (directResponse.data && directResponse.data.data && directResponse.data.data.task) {
          return directResponse.data.data.task;
        }
        
        throw new Error('Invalid response format from server');
      } catch (directError) {
        console.error('Direct API request failed:', directError);
        
        // Fall back to the regular API service
        console.log('Falling back to regular API service');
        const response = await apiService.post<ApiResponse<{ task: MaintenanceTask }>>('/maintenance', formattedTask);
        
        // Check if the response has the expected structure
        if (!response.data || !response.data.task) {
          console.error('Invalid response format from create task API:', response);
          throw new Error('Invalid response format from server');
        }
        
        return response.data.task as MaintenanceTask;
      }
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
      
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found for updating task');
      }
      
      // Try direct API request first
      try {
        console.log('Attempting direct API request to update task');
        const response = await axios.put<any>(
          `http://localhost:3000/api/v1/maintenance/${id}`,
          task,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token || 'dummy-access-token'}`
            }
          }
        );
        console.log('Direct API update response:', response.data);
        
        // Check if the response has the expected structure
        if (response.data && response.data.data && response.data.data.task) {
          return response.data.data.task;
        } else if (response.data && response.data.task) {
          return response.data.task;
        } else {
          console.error('Unexpected response structure:', response.data);
          throw new Error('Unexpected response structure');
        }
      } catch (directError) {
        console.error('Direct API request failed:', directError);
        console.log('Falling back to regular API service');
      }
      
      // Fall back to regular API service
      const response = await apiService.put<ApiResponse<{ task: MaintenanceTask }>>(`/maintenance/${id}`, task);
      return response.data?.task as MaintenanceTask;
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
      console.log(`Deleting maintenance task ${id}`);
      
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found for deleting task');
      }
      
      // Try direct API request first
      try {
        console.log('Attempting direct API request to delete task');
        await axios.delete(
          `http://localhost:3000/api/v1/maintenance/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token || 'dummy-access-token'}`
            }
          }
        );
        console.log('Direct API delete successful');
        return;
      } catch (directError) {
        console.error('Direct API request failed:', directError);
        console.log('Falling back to regular API service');
      }
      
      // Fall back to regular API service
      await apiService.delete<ApiResponse<void>>(`/maintenance/${id}`);
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
      console.log(`Toggling completion for task ${id} to ${isComplete}`);
      
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found for toggling task completion');
      }
      
      // Try direct API request first
      try {
        console.log('Attempting direct API request to toggle task completion');
        const response = await axios.put<any>(
          `http://localhost:3000/api/v1/maintenance/${id}/toggle-completion`,
          { isComplete },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token || 'dummy-access-token'}`
            }
          }
        );
        console.log('Direct API toggle completion response:', response.data);
        
        // Check if the response has the expected structure
        if (response.data && response.data.data && response.data.data.task) {
          return response.data.data.task;
        } else if (response.data && response.data.task) {
          return response.data.task;
        } else {
          console.error('Unexpected response structure:', response.data);
          throw new Error('Unexpected response structure');
        }
      } catch (directError) {
        console.error('Direct API request failed:', directError);
        console.log('Falling back to regular API service');
      }
      
      // Use PUT instead of PATCH since the API service doesn't have a patch method
      const response = await apiService.put<ApiResponse<{ task: MaintenanceTask }>>(
        `/maintenance/${id}/toggle-completion`, 
        { isComplete }
      );
      return response.data?.task as MaintenanceTask;
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
      const response = await apiService.get<ApiResponse<{ tasks: MaintenanceTask[] }>>('/maintenance/status/overdue');
      return response.data?.tasks || [];
    } catch (error) {
      console.error('Error in getOverdueTasks:', error);
      throw error;
    }
  },

  /**
   * Get upcoming maintenance tasks
   */
  async getUpcomingTasks(days: number = 7): Promise<MaintenanceTask[]> {
    try {
      const response = await apiService.get<ApiResponse<{ tasks: MaintenanceTask[] }>>(`/maintenance/status/upcoming?days=${days}`);
      return response.data?.tasks || [];
    } catch (error) {
      console.error('Error in getUpcomingTasks:', error);
      throw error;
    }
  }
};

export default maintenanceService; 