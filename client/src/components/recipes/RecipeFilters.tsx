/**
 * Recipe Filters Component
 * 
 * Provides filtering options for recipes
 */

import React from 'react';
import { FaFilter } from 'react-icons/fa';

type RecipeFilter = 'all' | 'favorites' | 'breakfast' | 'lunch' | 'dinner' | 'vegetarian';

interface RecipeFiltersProps {
  activeFilter: RecipeFilter;
  onFilterChange: (filter: RecipeFilter) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters: { id: RecipeFilter; label: string }[] = [
    { id: 'all', label: 'All Recipes' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'vegetarian', label: 'Vegetarian' },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <FaFilter className="mr-2 text-gray-600 dark:text-gray-300" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Filters</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecipeFilters; 