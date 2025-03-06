/**
 * Recipes Page
 *
 * Page for recipe management and meal planning
 */

import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';

// Mock recipe data (will be replaced with API calls)
const mockRecipes = [
  {
    id: '1',
    title: 'Vegetable Stir Fry',
    description: 'A quick and healthy vegetable stir fry with soy sauce and ginger.',
    ingredients: [
      { name: 'Bell Pepper', amount: '1', unit: 'whole' },
      { name: 'Broccoli', amount: '2', unit: 'cups' },
      { name: 'Carrots', amount: '2', unit: 'medium' },
      { name: 'Garlic', amount: '2', unit: 'cloves' },
      { name: 'Ginger', amount: '1', unit: 'tablespoon' },
      { name: 'Soy Sauce', amount: '3', unit: 'tablespoons' },
      { name: 'Vegetable Oil', amount: '2', unit: 'tablespoons' },
    ],
    instructions: '1. Heat oil in a wok or large frying pan.\n2. Add garlic and ginger, stir for 30 seconds.\n3. Add vegetables and stir fry for 5-7 minutes.\n4. Add soy sauce and stir to combine.\n5. Serve hot.',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    imageUrl: null,
    tags: ['dinner', 'vegetarian', 'quick', 'healthy'],
    calories: 220,
    favorited: true,
  },
  {
    id: '2',
    title: 'Classic Spaghetti Bolognese',
    description: 'Traditional Italian pasta dish with a rich meat sauce.',
    ingredients: [
      { name: 'Spaghetti', amount: '1', unit: 'pound' },
      { name: 'Ground Beef', amount: '1', unit: 'pound' },
      { name: 'Onion', amount: '1', unit: 'medium' },
      { name: 'Garlic', amount: '3', unit: 'cloves' },
      { name: 'Tomato Paste', amount: '2', unit: 'tablespoons' },
      { name: 'Crushed Tomatoes', amount: '28', unit: 'ounces' },
      { name: 'Dried Oregano', amount: '1', unit: 'teaspoon' },
      { name: 'Dried Basil', amount: '1', unit: 'teaspoon' },
      { name: 'Salt', amount: '1', unit: 'teaspoon' },
      { name: 'Pepper', amount: '1/2', unit: 'teaspoon' },
      { name: 'Olive Oil', amount: '2', unit: 'tablespoons' },
    ],
    instructions: '1. Cook spaghetti according to package directions.\n2. In a large skillet, heat olive oil and cook onion until translucent.\n3. Add garlic and cook for 30 seconds.\n4. Add ground beef and cook until browned.\n5. Add tomato paste, crushed tomatoes, oregano, basil, salt, and pepper.\n6. Simmer for 20 minutes.\n7. Serve sauce over cooked spaghetti.',
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    imageUrl: null,
    tags: ['dinner', 'italian', 'pasta', 'beef'],
    calories: 450,
    favorited: false,
  },
  {
    id: '3',
    title: 'Avocado Toast with Poached Egg',
    description: 'Simple and nutritious breakfast with creamy avocado and protein-rich eggs.',
    ingredients: [
      { name: 'Whole Grain Bread', amount: '2', unit: 'slices' },
      { name: 'Avocado', amount: '1', unit: 'ripe' },
      { name: 'Eggs', amount: '2', unit: 'large' },
      { name: 'Lemon Juice', amount: '1', unit: 'teaspoon' },
      { name: 'Red Pepper Flakes', amount: '1/4', unit: 'teaspoon' },
      { name: 'Salt', amount: '1/4', unit: 'teaspoon' },
      { name: 'Black Pepper', amount: '1/8', unit: 'teaspoon' },
    ],
    instructions: '1. Toast bread slices.\n2. Mash avocado with lemon juice, salt, and pepper.\n3. Spread avocado mixture on toasted bread.\n4. Poach eggs and place on top of avocado toast.\n5. Sprinkle with red pepper flakes and serve.',
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    imageUrl: null,
    tags: ['breakfast', 'vegetarian', 'quick', 'healthy'],
    calories: 320,
    favorited: true,
  },
  {
    id: '4',
    title: 'Chicken Caesar Salad',
    description: 'Classic Caesar salad with grilled chicken, romaine lettuce, and homemade dressing.',
    ingredients: [
      { name: 'Chicken Breast', amount: '2', unit: 'boneless' },
      { name: 'Romaine Lettuce', amount: '1', unit: 'head' },
      { name: 'Parmesan Cheese', amount: '1/2', unit: 'cup' },
      { name: 'Croutons', amount: '1', unit: 'cup' },
      { name: 'Anchovy Fillets', amount: '2', unit: 'fillets' },
      { name: 'Garlic', amount: '1', unit: 'clove' },
      { name: 'Dijon Mustard', amount: '1', unit: 'teaspoon' },
      { name: 'Lemon Juice', amount: '2', unit: 'tablespoons' },
      { name: 'Egg Yolk', amount: '1', unit: 'large' },
      { name: 'Olive Oil', amount: '1/3', unit: 'cup' },
      { name: 'Salt', amount: '1/4', unit: 'teaspoon' },
      { name: 'Black Pepper', amount: '1/4', unit: 'teaspoon' },
    ],
    instructions: '1. Season chicken breasts with salt and pepper, grill until cooked through.\n2. Chop romaine lettuce and place in a large salad bowl.\n3. For the dressing, combine anchovies, garlic, mustard, lemon juice, and egg yolk in a blender.\n4. Slowly add olive oil while blending to emulsify.\n5. Toss lettuce with dressing, Parmesan cheese, and croutons.\n6. Slice grilled chicken and place on top of the salad.\n7. Serve with extra Parmesan cheese if desired.',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    imageUrl: null,
    tags: ['lunch', 'dinner', 'salad', 'chicken'],
    calories: 380,
    favorited: false,
  },
];

/**
 * Recipe Card Component
 */
const RecipeCard: React.FC<{ recipe: any }> = ({ recipe }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {recipe.title}
          </h3>
          <button
            className={`p-1 rounded-full ${
              recipe.favorited
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-gray-500'
            }`}
            aria-label={recipe.favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-5 h-5"
              fill={recipe.favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {recipe.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {recipe.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <div className="flex space-x-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Prep:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{recipe.prepTime} min</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cook:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{recipe.cookTime} min</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Calories:</span>{' '}
            <span className="text-gray-700 dark:text-gray-300">{recipe.calories}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            View Recipe
          </Button>
          <Button variant="ghost" size="sm">
            Add to Meal Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Recipe filter types
 */
type RecipeFilter = 'all' | 'favorites' | 'breakfast' | 'lunch' | 'dinner' | 'vegetarian';

/**
 * Recipes page component
 */
const RecipesPage: React.FC = () => {
  // Local state
  const [recipes, setRecipes] = useState(mockRecipes);
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        recipe.description.toLowerCase().includes(query) ||
        recipe.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Recipes header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Recipes</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Discover and organize your favorite recipes
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
              Add Recipe
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-64">
              <label htmlFor="search" className="sr-only">
                Search recipes
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
                  placeholder="Search recipes..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('all')}
              >
                All Recipes
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  filter === 'favorites'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('favorites')}
              >
                Favorites
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  filter === 'breakfast'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('breakfast')}
              >
                Breakfast
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  filter === 'lunch'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('lunch')}
              >
                Lunch
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  filter === 'dinner'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('dinner')}
              >
                Dinner
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  filter === 'vegetarian'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('vegetarian')}
              >
                Vegetarian
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

        {/* No recipes message */}
        {!isLoading && filteredRecipes.length === 0 && (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No recipes found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No recipes match your search criteria.'
                : filter !== 'all'
                ? `No recipes in the "${filter}" category.`
                : 'Get started by adding your first recipe.'}
            </p>
            {(filter !== 'all' || searchQuery) && (
              <button
                className="mt-4 text-sm text-primary hover:text-primary-dark"
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
              >
                View all recipes
              </button>
            )}
          </div>
        )}

        {/* Recipes grid */}
        {!isLoading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
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
                This page currently displays mock data. In a production version, it would connect to the backend API for recipe management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipesPage;