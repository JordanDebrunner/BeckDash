/**
 * Recipe Service
 *
 * Service for handling recipe-related database operations
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import { Recipe } from '@prisma/client';

/**
 * Recipe service class
 */
class RecipeService {
  /**
   * Get all recipes for a user
   */
  async getRecipes(userId: string): Promise<Recipe[]> {
    try {
      return await prisma.recipe.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error fetching recipes:', error);
      throw error;
    }
  }

  /**
   * Get a single recipe by ID
   */
  async getRecipe(recipeId: string, userId: string): Promise<Recipe | null> {
    try {
      return await prisma.recipe.findFirst({
        where: {
          id: recipeId,
          userId
        }
      });
    } catch (error) {
      logger.error(`Error fetching recipe with ID ${recipeId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(recipeData: any, userId: string): Promise<Recipe> {
    try {
      // Log the incoming data for debugging
      logger.debug('Creating recipe with data:', JSON.stringify(recipeData));
      
      // Create a minimal recipe with only the required fields
      const minimalRecipe = {
        title: recipeData.title,
        description: recipeData.description || null,
        ingredients: JSON.stringify(recipeData.ingredients || []),
        instructions: recipeData.instructions,
        prepTime: null,
        cookTime: null,
        servings: null,
        imageUrl: null,
        calories: null,
        tags: recipeData.tags || [],
        user: {
          connect: {
            id: userId
          }
        }
      };
      
      logger.debug('Creating minimal recipe:', JSON.stringify(minimalRecipe));
      
      // Create the recipe with minimal data
      const recipe = await prisma.recipe.create({
        data: minimalRecipe
      });
      
      logger.debug('Recipe created successfully:', JSON.stringify(recipe));
      
      return recipe;
    } catch (error) {
      logger.error('Error creating recipe:', error);
      // Log more details about the error
      if (error instanceof Error) {
        logger.error('Error message:', error.message);
        logger.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(recipeId: string, recipeData: Partial<Recipe>, userId: string): Promise<Recipe> {
    try {
      // Process ingredients to ensure it's in the correct format
      let processedData: any = { ...recipeData };
      
      // Handle ingredients if present
      if (recipeData.ingredients !== undefined) {
        processedData.ingredients = typeof recipeData.ingredients === 'string' 
          ? recipeData.ingredients 
          : JSON.stringify(recipeData.ingredients);
      }
      
      // Remove userId from the update data if present
      if ('userId' in processedData) {
        delete processedData.userId;
      }
      
      return await prisma.recipe.update({
        where: {
          id: recipeId,
          userId
        },
        data: processedData
      });
    } catch (error) {
      logger.error(`Error updating recipe with ID ${recipeId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<Recipe> {
    try {
      return await prisma.recipe.delete({
        where: {
          id: recipeId,
          userId
        }
      });
    } catch (error) {
      logger.error(`Error deleting recipe with ID ${recipeId}:`, error);
      throw error;
    }
  }

  /**
   * Toggle recipe favorite status
   */
  async toggleFavorite(recipeId: string, userId: string): Promise<Recipe> {
    try {
      const recipe = await this.getRecipe(recipeId, userId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      return await prisma.recipe.update({
        where: {
          id: recipeId,
          userId
        },
        data: {
          favorited: !recipe.favorited
        }
      });
    } catch (error) {
      logger.error(`Error toggling favorite for recipe with ID ${recipeId}:`, error);
      throw error;
    }
  }

  /**
   * Get recipes by tag
   */
  async getRecipesByTag(tag: string, userId: string): Promise<Recipe[]> {
    try {
      return await prisma.recipe.findMany({
        where: {
          userId,
          tags: {
            has: tag
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error(`Error fetching recipes with tag ${tag}:`, error);
      throw error;
    }
  }

  /**
   * Search recipes
   */
  async searchRecipes(query: string, userId: string): Promise<Recipe[]> {
    try {
      return await prisma.recipe.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query.toLowerCase() } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error(`Error searching recipes with query ${query}:`, error);
      throw error;
    }
  }
}

export default new RecipeService();
