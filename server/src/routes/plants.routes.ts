/**
 * Plant Routes
 *
 * Routes for plant management
 */

import { Router } from 'express';
import plantController from '../controllers/plantController';
import { authenticate } from '../middleware/simpleAuth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Plant routes
router.get('/', plantController.getPlants);
router.post('/', plantController.createPlant);
router.get('/needs-care', plantController.getPlantsNeedingCare);
router.get('/:id', plantController.getPlant);
router.put('/:id', plantController.updatePlant);
router.delete('/:id', plantController.deletePlant);
router.post('/:id/care-logs', plantController.logCare);
router.get('/:id/care-logs', plantController.getCareLogs);

export default router;
