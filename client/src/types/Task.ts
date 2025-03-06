/**
 * Task type definitions
 *
 * Defines the structure of tasks in the application
 */

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Task status options
 */
export type TaskStatus = 'todo' | 'inProgress' | 'done';

/**
 * Task category options
 */
export type TaskCategory =
  | 'work'
  | 'personal'
  | 'shopping'
  | 'health'
  | 'finance'
  | 'home'
  | 'family'
  | 'other';

/**
 * Base task interface
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;          // ISO date string
  completedAt?: string;      // ISO date string
  priority?: TaskPriority;
  status: TaskStatus;
  category?: TaskCategory;
  reminderAt?: string;       // ISO date string
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  userId: string;
}

/**
 * Task creation request
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;       // Defaults to 'todo'
  category?: TaskCategory;
  reminderAt?: string;
}

/**
 * Task update request
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  reminderAt?: string;
}

/**
 * Task response from API
 */
export interface TaskResponse {
  task: Task;
}

/**
 * Tasks list response from API
 */
export interface TasksListResponse {
  tasks: Task[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Task filter parameters
 */
export interface TasksFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  search?: string;
  dueDate?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Task completion toggle request
 */
export interface TaskCompletionRequest {
  completed: boolean;
}