/**
 * Recipe Service
 *
 * Service for making API calls related to recipes
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiUtils';

// API base URL
const API_BASE_URL = '/api/v1';

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  imageUrl: string | null;
  favorited: boolean;
  calories: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateRecipeData {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  calories?: number;
  tags: string[];
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {}

class RecipeService {
  /**
   * Get all recipes
   */
  async getRecipes(): Promise<Recipe[]> {
    try {
      console.log('RecipeService: Fetching recipes');
      
      const response = await apiGet<{ recipes: Recipe[] }>(`${API_BASE_URL}/recipes`);
      let recipes = response.recipes || [];
      
      // Parse ingredients for each recipe
      recipes.forEach((recipe: Recipe) => {
        if (typeof recipe.ingredients === 'string') {
          try {
            recipe.ingredients = JSON.parse(recipe.ingredients as unknown as string);
          } catch (parseError) {
            console.error(`RecipeService: Error parsing ingredients for recipe ${recipe.id}:`, parseError);
            recipe.ingredients = [];
          }
        }
      });
      
      return recipes;
    } catch (error) {
      console.error('RecipeService: Error fetching recipes:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get a single recipe by ID
   */
  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await apiGet<{ recipe: Recipe }>(`${API_BASE_URL}/recipes/${id}`);
      let recipe = response.recipe;
      
      // Parse ingredients if it's a string
      if (recipe && typeof recipe.ingredients === 'string') {
        try {
          recipe.ingredients = JSON.parse(recipe.ingredients as unknown as string);
        } catch (parseError) {
          console.error('RecipeService: Error parsing ingredients:', parseError);
          recipe.ingredients = [];
        }
      }
      
      return recipe;
    } catch (error) {
      console.error(`RecipeService: Error fetching recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    try {
      console.log('RecipeService: Creating recipe', data);
      
      // Create a minimal recipe with only the required fields
      const minimalRecipe = {
        title: data.title,
        description: data.description || '',
        ingredients: data.ingredients || [],
        instructions: data.instructions,
        tags: data.tags || []
      };
      
      console.log('RecipeService: Sending minimal recipe data:', minimalRecipe);
      
      const response = await apiPost<{ recipe: Recipe }>(`${API_BASE_URL}/recipes`, minimalRecipe);
      let recipe = response.recipe;
      
      // Parse ingredients if it's a string
      if (recipe && typeof recipe.ingredients === 'string') {
        try {
          recipe.ingredients = JSON.parse(recipe.ingredients as unknown as string);
        } catch (parseError) {
          console.error('RecipeService: Error parsing ingredients:', parseError);
          recipe.ingredients = [];
        }
      }
      
      return recipe;
    } catch (error) {
      console.error('RecipeService: Error creating recipe:', error);
      throw error;
    }
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, data: UpdateRecipeData): Promise<Recipe> {
    try {
      console.log('RecipeService: Updating recipe', data);
      
      // Process the data to ensure proper format
      const processedData = {
        ...data,
        // Convert ingredients to array if needed
        ingredients: data.ingredients || [],
        // Convert numeric fields
        prepTime: data.prepTime ? Number(data.prepTime) : undefined,
        cookTime: data.cookTime ? Number(data.cookTime) : undefined,
        servings: data.servings ? Number(data.servings) : undefined,
        calories: data.calories ? Number(data.calories) : undefined
      };
      
      console.log('RecipeService: Processed update data:', processedData);
      
      const response = await apiPut<{ recipe: Recipe }>(`${API_BASE_URL}/recipes/${id}`, processedData);
      let recipe = response.recipe;
      
      // Parse ingredients if it's a string
      if (recipe && typeof recipe.ingredients === 'string') {
        try {
          recipe.ingredients = JSON.parse(recipe.ingredients as unknown as string);
        } catch (parseError) {
          console.error('RecipeService: Error parsing ingredients:', parseError);
          recipe.ingredients = [];
        }
      }
      
      return recipe;
    } catch (error) {
      console.error(`RecipeService: Error updating recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<void> {
    try {
      await apiDelete(`${API_BASE_URL}/recipes/${id}`);
    } catch (error) {
      console.error(`RecipeService: Error deleting recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle favorite status of a recipe
   */
  async toggleFavorite(id: string): Promise<Recipe> {
    try {
      const response = await apiPut<{ recipe: Recipe }>(`${API_BASE_URL}/recipes/${id}/favorite`, {});
      let recipe = response.recipe;
      
      // Parse ingredients if it's a string
      if (recipe && typeof recipe.ingredients === 'string') {
        try {
          recipe.ingredients = JSON.parse(recipe.ingredients as unknown as string);
        } catch (parseError) {
          console.error('RecipeService: Error parsing ingredients:', parseError);
          recipe.ingredients = [];
        }
      }
      
      return recipe;
    } catch (error) {
      console.error(`RecipeService: Error toggling favorite for recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search for recipes
   */
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const response = await apiGet<{ recipes: Recipe[] }>(`${API_BASE_URL}/recipes/search?q=${encodeURIComponent(query)}`);
      let recipes = response.recipes || [];
      
      // Parse ingredients for each recipe
      recipes.forEach((recipe: Recipe) => {
        if (typeof recipe.ingredients === 'string') {
          try {
            recipe.ingredients = JSON.parse(recipe.ingredients as unknown as string);
          } catch (parseError) {
            console.error(`RecipeService: Error parsing ingredients for recipe ${recipe.id}:`, parseError);
            recipe.ingredients = [];
          }
        }
      });
      
      return recipes;
    } catch (error) {
      console.error('RecipeService: Error searching recipes:', error);
      return [];
    }
  }
}

const recipeService = new RecipeService();
export default recipeService; 