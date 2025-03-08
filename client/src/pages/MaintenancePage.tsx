/**
 * Maintenance Page
 *
 * Page for tracking home maintenance tasks
 */

import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import TaskList from '../components/maintenance/TaskList';
import TaskForm from '../components/maintenance/TaskForm';
import Modal from '../components/common/Modal';
import maintenanceService, { MaintenanceTask, CreateMaintenanceTaskInput, UpdateMaintenanceTaskInput } from '../services/maintenance.service';
import { toast } from 'react-hot-toast';

const MaintenancePage: React.FC = () => {
  // Local state
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [filter, setFilter] = useState('all'); // all, pending, overdue, completed
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, category
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await maintenanceService.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      toast.error('Failed to load maintenance tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task creation
  const handleCreateTask = async (taskData: CreateMaintenanceTaskInput) => {
    try {
      setIsLoading(true);
      const newTask = await maintenanceService.createTask(taskData);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setIsModalOpen(false);
      toast.success('Maintenance task created successfully');
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      toast.error('Failed to create maintenance task');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskData: UpdateMaintenanceTaskInput) => {
    if (!selectedTask) return;

    try {
      setIsLoading(true);
      const updatedTask = await maintenanceService.updateTask(selectedTask.id, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setIsModalOpen(false);
      setSelectedTask(undefined);
      toast.success('Maintenance task updated successfully');
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      toast.error('Failed to update maintenance task');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setIsLoading(true);
      await maintenanceService.deleteTask(taskToDelete);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      toast.success('Maintenance task deleted successfully');
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      toast.error('Failed to delete maintenance task');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task completion toggle
  const handleToggleComplete = async (id: string, isComplete: boolean) => {
    try {
      setIsLoading(true);
      const updatedTask = await maintenanceService.toggleTaskCompletion(id, isComplete);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      toast.success(`Task marked as ${isComplete ? 'complete' : 'incomplete'}`);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const handleEditTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteConfirmation = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = [...tasks]
    // Apply filter
    .filter(task => {
      // Filter by status
      if (filter === 'pending') {
        return !task.completedDate;
      }
      if (filter === 'overdue') {
        return !task.completedDate && task.dueDate && new Date(task.dueDate) < new Date();
      }
      if (filter === 'completed') {
        return !!task.completedDate;
      }

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.category && task.category.toLowerCase().includes(query))
        );
      }

      return true;
    })
    // Apply sorting
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Handle null or undefined dueDate
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const aPriority = a.priority || 'low';
        const bPriority = b.priority || 'low';
        return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder];
      }
      if (sortBy === 'category') {
        const aCategory = a.category || '';
        const bCategory = b.category || '';
        return aCategory.localeCompare(bCategory);
      }
      return 0;
    });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Maintenance header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Home Maintenance
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track and manage home maintenance tasks
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="primary" 
              onClick={() => {
                setSelectedTask(undefined);
                setIsModalOpen(true);
              }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Task
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="w-full sm:w-64">
                <label htmlFor="search" className="sr-only">
                  Search tasks
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:text-white sm:text-sm"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div>
                  <label htmlFor="filter" className="sr-only">
                    Filter
                  </label>
                  <select
                    id="filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sortBy" className="sr-only">
                    Sort by
                  </label>
                  <select
                    id="sortBy"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TaskList
            tasks={filteredAndSortedTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteConfirmation}
          />
        )}

        {/* Task form modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(undefined);
          }}
          title={selectedTask ? 'Edit Maintenance Task' : 'Create Maintenance Task'}
        >
          <TaskForm
            task={selectedTask}
            onSubmit={(taskData) => selectedTask ? handleUpdateTask(taskData as UpdateMaintenanceTaskInput) : handleCreateTask(taskData as CreateMaintenanceTaskInput)}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedTask(undefined);
            }}
          />
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
          }}
          title="Delete Maintenance Task"
        >
          <div className="p-6">
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this maintenance task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTaskToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteTask}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default MaintenancePage;