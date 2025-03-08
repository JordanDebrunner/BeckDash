/**
 * Shared Maintenance Types
 * 
 * Type definitions for maintenance tasks shared between client and server
 */

// Base maintenance task interface
export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  completedDate?: Date | string | null;
  frequency?: string | null;
  category?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

// Input for creating a new maintenance task
export interface CreateMaintenanceTaskInput {
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  frequency?: string | null;
  category?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  notes?: string | null;
}

// Input for updating an existing maintenance task
export interface UpdateMaintenanceTaskInput extends Partial<CreateMaintenanceTaskInput> {
  completedDate?: Date | string | null;
}

// Response for getting all maintenance tasks
export interface MaintenanceTasksResponse {
  tasks: MaintenanceTask[];
}

// Response for getting a single maintenance task
export interface MaintenanceTaskResponse {
  task: MaintenanceTask;
}

// Input for toggling task completion
export interface ToggleTaskCompletionInput {
  isComplete: boolean;
} 