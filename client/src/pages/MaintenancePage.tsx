/**
 * Maintenance Page
 *
 * Page for tracking home maintenance tasks
 */

import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { formatDateToLocale } from '../utils/dateUtils';

// Mock maintenance task data (will be replaced with API calls)
const mockMaintenanceTasks = [
  {
    id: '1',
    title: 'Change HVAC Filter',
    description: 'Replace with a MERV 13 filter',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    completedDate: null,
    frequency: 'Monthly',
    category: 'HVAC',
    priority: 'high',
    notes: 'Filters are in the garage cabinet',
  },
  {
    id: '2',
    title: 'Clean Gutters',
    description: 'Remove debris and check for damage',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    completedDate: null,
    frequency: 'Quarterly',
    category: 'Exterior',
    priority: 'medium',
    notes: 'Need to borrow ladder from neighbor',
  },
  {
    id: '3',
    title: 'Check Smoke Detectors',
    description: 'Test all smoke detectors and replace batteries if needed',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    completedDate: null,
    frequency: 'Yearly',
    category: 'Safety',
    priority: 'high',
    notes: '9V batteries in the kitchen drawer',
  },
  {
    id: '4',
    title: 'Flush Water Heater',
    description: 'Drain water to remove sediment buildup',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    completedDate: null,
    frequency: 'Yearly',
    category: 'Plumbing',
    priority: 'medium',
    notes: 'Check YouTube video for instructions',
  },
  {
    id: '5',
    title: 'Fix Leaking Faucet',
    description: 'Replace washers in the bathroom sink faucet',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    completedDate: null,
    frequency: 'One-time',
    category: 'Plumbing',
    priority: 'low',
    notes: 'Buy replacement parts at hardware store',
  },
  {
    id: '6',
    title: 'Replace Air Filters',
    description: 'Replace the air filters in all rooms',
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    completedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // completed 9 days ago
    frequency: 'Monthly',
    category: 'HVAC',
    priority: 'medium',
    notes: 'Filters are stored in the basement',
  },
];

/**
 * Task List Item Component
 */
const TaskListItem: React.FC<{ task: any; onToggleComplete: (id: string) => void; onEdit: (id: string) => void }> = ({
  task,
  onToggleComplete,
  onEdit,
}) => {
  // Determine if the task is overdue
  const isOverdue = !task.completedDate && new Date(task.dueDate) < new Date();

  // Determine task status
  const getStatusColor = () => {
    if (task.completedDate) {
      return 'bg-green-500';
    }
    if (isOverdue) {
      return 'bg-red-500';
    }
    if (task.priority === 'high') {
      return 'bg-amber-500';
    }
    return 'bg-blue-500';
  };

  // Determine priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${
      task.completedDate
        ? 'border-green-500'
        : isOverdue
          ? 'border-red-500'
          : task.priority === 'high'
            ? 'border-amber-500'
            : 'border-blue-500'
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <input
              type="checkbox"
              checked={!!task.completedDate}
              onChange={() => onToggleComplete(task.id)}
              className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-lg font-medium ${
                  task.completedDate ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'
                }`}>
                  {task.title}
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {task.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    {task.frequency}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor()}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              <div className="ml-4 flex-shrink-0">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => onEdit(task.id)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <span className="sr-only">Edit</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {task.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}

            {task.notes && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500 italic">
                Notes: {task.notes}
              </p>
            )}

            <div className="mt-2 text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Due:</span>{' '}
                  <span className={`${
                    isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {formatDateToLocale(task.dueDate)} {isOverdue && '(Overdue)'}
                  </span>
                </div>

                {task.completedDate && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Completed:</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDateToLocale(task.completedDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Maintenance page component
 */
const MaintenancePage: React.FC = () => {
  // Local state
  const [tasks, setTasks] = useState(mockMaintenanceTasks);
  const [filter, setFilter] = useState('all'); // all, pending, overdue, completed
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, category

  // Handle task completion toggle
  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          return {
            ...task,
            completedDate: task.completedDate ? null : new Date(),
          };
        }
        return task;
      })
    );
  };

  // Handle task edit (placeholder for now)
  const handleEditTask = (id: string) => {
    console.log(`Edit task ${id}`);
    // In a real implementation, this would open a modal to edit the task
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
        return !task.completedDate && new Date(task.dueDate) < new Date();
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
          task.category.toLowerCase().includes(query)
        );
      }

      return true;
    })
    // Apply sorting
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
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
            <Button variant="primary" onClick={() => {}}>
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
                    type="text"
                    id="search"
                    placeholder="Search tasks..."
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('all')}
              >
                All Tasks
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'pending'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'overdue'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('overdue')}
              >
                Overdue
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'completed'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* No tasks message */}
        {!isLoading && filteredAndSortedTasks.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No tasks found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No tasks match your search criteria.'
                : filter === 'pending'
                ? 'No pending tasks. All caught up!'
                : filter === 'overdue'
                ? 'No overdue tasks. Great job staying on top of things!'
                : filter === 'completed'
                ? 'No completed tasks yet. Start by completing a task.'
                : 'Get started by adding your first maintenance task.'}
            </p>
            {(filter !== 'all' || searchQuery) && (
              <button
                className="mt-4 text-sm text-primary hover:text-primary-dark"
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
              >
                View all tasks
              </button>
            )}
          </div>
        )}

        {/* Task list */}
        {!isLoading && filteredAndSortedTasks.length > 0 && (
          <div className="space-y-4">
            {filteredAndSortedTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        )}

        {/* Implementation note for future development */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Development Note
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                This page currently displays mock data. In a production version, it would connect to the backend API for maintenance task management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MaintenancePage;