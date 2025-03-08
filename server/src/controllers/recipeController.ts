/**
 * Recipe Controller
 *
 * Handles HTTP requests related to recipes
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { badRequest, created, notFound, success, serverError } from '../utils/responseFormatter';
import logger from '../utils/logger';
import { RequestWithUser } from '../types/RequestWithUser';
import recipeService from '../services/recipeService';

// Validation schemas
const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().min(1, 'Amount is required'),
  unit: z.string().min(1, 'Unit is required'),
  optional: z.boolean().optional()
});

const recipeSchema = z.object({
  title: z.string().min(1, 'Recipe title is required'),
  description: z.string().optional().nullable(),
  ingredients: z.array(ingredientSchema),
  instructions: z.string().min(1, 'Instructions are required'),
  prepTime: z.number().int().min(0).optional().nullable(),
  cookTime: z.number().int().min(0).optional().nullable(),
  servings: z.number().int().min(0).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  calories: z.number().int().min(0).optional().nullable(),
  tags: z.array(z.string())
});

/**
 * Recipe controller
 */
const recipeController = {
  /**
   * Get all recipes for the authenticated user
   */
  getRecipes: async (req: RequestWithUser, res: Response) => {
    try {
      const recipes = await recipeService.getRecipes(req.userId!);
      return success(res, { recipes });
    } catch (error) {
      logger.error('Error fetching recipes:', error);
      return serverError(res, 'Failed to fetch recipes');
    }
  },

  /**
   * Get a single recipe by ID
   */
  getRecipe: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      const recipe = await recipeService.getRecipe(id, req.userId!);
      
      if (!recipe) {
        return notFound(res, 'Recipe not found');
      }
      
      return success(res, { recipe });
    } catch (error) {
      logger.error(`Error fetching recipe with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to fetch recipe');
    }
  },

  /**
   * Create a new recipe
   */
  createRecipe: async (req: RequestWithUser, res: Response) => {
    try {
      logger.debug('Creating recipe with data:', JSON.stringify(req.body));
      
      // Basic validation for required fields
      if (!req.body.title || !req.body.instructions) {
        logger.error('Recipe validation failed: Missing required fields');
        return badRequest(res, 'Invalid recipe data', [
          { message: 'Recipe title is required' },
          { message: 'Instructions are required' }
        ]);
      }
      
      // Create the recipe with the service
      try {
        const recipe = await recipeService.createRecipe(req.body, req.userId!);
        return created(res, { recipe });
      } catch (serviceError) {
        logger.error('Error in recipe service:', serviceError);
        return serverError(res, 'Failed to create recipe');
      }
    } catch (error) {
      logger.error('Error creating recipe:', error);
      return serverError(res, 'Failed to create recipe');
    }
  },

  /**
   * Update an existing recipe
   */
  updateRecipe: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      const validationResult = recipeSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return badRequest(res, 'Invalid recipe data', validationResult.error.errors);
      }
      
      // Check if recipe exists and belongs to user
      const existingRecipe = await recipeService.getRecipe(id, req.userId!);
      if (!existingRecipe) {
        return notFound(res, 'Recipe not found');
      }
      
      const recipeData = validationResult.data;
      const updatedRecipe = await recipeService.updateRecipe(id, recipeData, req.userId!);
      
      return success(res, { recipe: updatedRecipe });
    } catch (error) {
      logger.error(`Error updating recipe with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to update recipe');
    }
  },

  /**
   * Delete a recipe
   */
  deleteRecipe: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if recipe exists and belongs to user
      const existingRecipe = await recipeService.getRecipe(id, req.userId!);
      if (!existingRecipe) {
        return notFound(res, 'Recipe not found');
      }
      
      await recipeService.deleteRecipe(id, req.userId!);
      
      return success(res, { message: 'Recipe deleted successfully' });
    } catch (error) {
      logger.error(`Error deleting recipe with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to delete recipe');
    }
  },

  /**
   * Toggle recipe favorite status
   */
  toggleFavorite: async (req: RequestWithUser, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if recipe exists and belongs to user
      const existingRecipe = await recipeService.getRecipe(id, req.userId!);
      if (!existingRecipe) {
        return notFound(res, 'Recipe not found');
      }
      
      const recipe = await recipeService.toggleFavorite(id, req.userId!);
      
      return success(res, { recipe });
    } catch (error) {
      logger.error(`Error toggling favorite for recipe with ID ${req.params.id}:`, error);
      return serverError(res, 'Failed to toggle recipe favorite status');
    }
  },

  /**
   * Search recipes
   */
  searchRecipes: async (req: RequestWithUser, res: Response) => {
    try {
      const { query } = req.query;
      
      if (typeof query !== 'string') {
        return badRequest(res, 'Search query is required');
      }
      
      const recipes = await recipeService.searchRecipes(query, req.userId!);
      return success(res, { recipes });
    } catch (error) {
      logger.error('Error searching recipes:', error);
      return serverError(res, 'Failed to search recipes');
    }
  }
};

export default recipeController;
