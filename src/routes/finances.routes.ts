import { Router } from 'express';
import * as financesController from '../controllers/finances.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const financesRoutes = Router();

financesRoutes.use(requireAuth);

financesRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(financesController.list));
financesRoutes.post('/', requireRole('transporter'), asyncHandler(financesController.create));
