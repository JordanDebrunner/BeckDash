/**
 * Recipe Card Component
 * 
 * Displays a recipe card with basic information and actions
 */

import React from 'react';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { Recipe } from '../../services/recipe.service';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}) => {
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      await onDelete(recipe.id);
    }
  };

  const handleToggleFavorite = async () => {
    await onToggleFavorite(recipe.id);
  };

  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      {recipe.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{recipe.title}</h3>
          <button 
            onClick={handleToggleFavorite}
            className="text-red-500 hover:text-red-600 transition-colors"
            aria-label={recipe.favorited ? "Remove from favorites" : "Add to favorites"}
          >
            {recipe.favorited ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
        
        {recipe.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <FaClock className="mr-1" />
          <span>
            {recipe.prepTime || recipe.cookTime ? (
              <>
                {recipe.prepTime ? `Prep: ${formatTime(recipe.prepTime)}` : ''}
                {recipe.prepTime && recipe.cookTime ? ' · ' : ''}
                {recipe.cookTime ? `Cook: ${formatTime(recipe.cookTime)}` : ''}
              </>
            ) : (
              'Time not specified'
            )}
          </span>
        </div>
        
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onEdit(recipe)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm"
          >
            <FaEdit className="mr-1" /> Edit
          </button>
          
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center text-sm"
          >
            <FaTrash className="mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 