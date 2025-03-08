/**
 * Recipe Routes
 *
 * Routes for recipe management
 */

import { Router } from 'express';
import recipeController from '../controllers/recipeController';
import { authenticate } from '../middleware/simpleAuth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Recipe routes
router.get('/', recipeController.getRecipes);
router.post('/', recipeController.createRecipe);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', recipeController.getRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);
router.post('/:id/favorite', recipeController.toggleFavorite);

export default router;
