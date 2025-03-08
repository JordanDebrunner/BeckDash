/**
 * Recipes Page
 *
 * Page for recipe management and meal planning
 */

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeModal from '../components/recipes/RecipeModal';
import RecipeFilters from '../components/recipes/RecipeFilters';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import recipeService, { Recipe, CreateRecipeData, UpdateRecipeData } from '../services/recipe.service';
import Layout from '../components/common/Layout';

/**
 * Recipe filter types
 */
type RecipeFilter = 'all' | 'favorites' | 'breakfast' | 'lunch' | 'dinner' | 'vegetarian';

/**
 * Recipes page component
 */
const RecipesPage: React.FC = () => {
  // Local state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  // Fetch recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Fetch recipes from API
  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const fetchedRecipes = await recipeService.getRecipes();
      setRecipes(fetchedRecipes);
      setError(null);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recipe creation
  const handleCreateRecipe = async (data: CreateRecipeData) => {
    try {
      const newRecipe = await recipeService.createRecipe(data);
      setRecipes(prev => [newRecipe, ...prev]);
      setShowAddModal(false);
      toast.success('Recipe created successfully');
    } catch (error) {
      toast.error('Failed to create recipe');
    }
  };

  // Handle recipe update
  const handleUpdateRecipe = async (data: UpdateRecipeData) => {
    if (!currentRecipe) return;
    try {
      const updatedRecipe = await recipeService.updateRecipe(currentRecipe.id, data);
      setRecipes(prev =>
        prev.map(recipe => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe))
      );
      setShowEditModal(false);
      setCurrentRecipe(null);
      toast.success('Recipe updated successfully');
    } catch (error) {
      toast.error('Failed to update recipe');
    }
  };

  // Handle recipe deletion
  const handleDeleteRecipe = async (id: string) => {
    try {
      await recipeService.deleteRecipe(id);
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (error) {
      throw error;
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (id: string) => {
    try {
      const updatedRecipe = await recipeService.toggleFavorite(id);
      setRecipes(prev =>
        prev.map(recipe => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe))
      );
    } catch (error) {
      throw error;
    }
  };

  // Filter recipes based on selected filter and search query
  const filteredRecipes = recipes.filter(recipe => {
    // Apply category filter
    if (filter === 'favorites' && !recipe.favorited) {
      return false;
    }
    if (filter === 'breakfast' && !recipe.tags.includes('breakfast')) {
      return false;
    }
    if (filter === 'lunch' && !recipe.tags.includes('lunch')) {
      return false;
    }
    if (filter === 'dinner' && !recipe.tags.includes('dinner')) {
      return false;
    }
    if (filter === 'vegetarian' && !recipe.tags.includes('vegetarian')) {
      return false;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(query) ||
        (recipe.description?.toLowerCase() || '').includes(query) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Recipes"
          description="Discover and organize your favorite recipes"
          action={
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <FaPlus className="mr-2" /> Add Recipe
            </Button>
          }
        />

        <div className="mt-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-64 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <RecipeFilters activeFilter={filter} onFilterChange={setFilter} />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                <button
                  className="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  onClick={fetchRecipes}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredRecipes.length === 0 && (
          <EmptyState
            title="No recipes found"
            message={
              searchQuery
                ? 'No recipes match your search criteria.'
                : filter !== 'all'
                ? `No recipes in the "${filter}" category.`
                : 'Get started by adding your first recipe.'
            }
            action={
              searchQuery || filter !== 'all' ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                >
                  View all recipes
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <FaPlus className="mr-2" /> Add Recipe
                </Button>
              )
            }
          />
        )}

        {!isLoading && !error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={(recipe) => {
                  setCurrentRecipe(recipe);
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteRecipe}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        <RecipeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateRecipe as (data: CreateRecipeData | UpdateRecipeData) => Promise<void>}
          title="Add New Recipe"
        />

        {currentRecipe && (
          <RecipeModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setCurrentRecipe(null);
            }}
            onSave={handleUpdateRecipe as (data: CreateRecipeData | UpdateRecipeData) => Promise<void>}
            recipe={currentRecipe}
            title="Edit Recipe"
          />
        )}
      </div>
    </Layout>
  );
};

export default RecipesPage;