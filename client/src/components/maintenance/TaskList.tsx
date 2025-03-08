/**
 * Maintenance Task List Component
 *
 * Displays a list of maintenance tasks with filtering and sorting options
 */

import React from 'react';
import { MaintenanceTask } from '../../services/maintenance.service';
import { formatDateToLocale } from '../../utils/dateUtils';

interface TaskListProps {
  tasks: MaintenanceTask[];
  onToggleComplete: (id: string, isComplete: boolean) => void;
  onEdit: (task: MaintenanceTask) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onEdit, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No maintenance tasks found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Task
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Frequency
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              // Determine if the task is overdue
              const isOverdue = !task.completedDate && task.dueDate && new Date(task.dueDate) < new Date();
              
              // Determine task status
              const getStatusColor = () => {
                if (task.completedDate) {
                  return 'bg-green-500';
                }
                if (isOverdue) {
                  return 'bg-red-500';
                }
                return 'bg-yellow-500';
              };

              return (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => onToggleComplete(task.id, !task.completedDate)}
                        className={`h-4 w-4 rounded-full ${getStatusColor()} mr-2 flex-shrink-0`}
                        aria-label={task.completedDate ? 'Mark as incomplete' : 'Mark as complete'}
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {task.completedDate
                          ? 'Completed'
                          : isOverdue
                          ? 'Overdue'
                          : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{task.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.dueDate ? formatDateToLocale(new Date(task.dueDate)) : 'No due date'}
                    </div>
                    {task.completedDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Completed: {formatDateToLocale(new Date(task.completedDate))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                      {task.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100'
                          : 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                      }`}
                    >
                      {task.priority || 'Low'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {task.frequency || 'One-time'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
