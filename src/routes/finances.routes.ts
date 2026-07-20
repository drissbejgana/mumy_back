import { Router } from 'express';
import * as financesController from '../controllers/finances.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const financesRoutes = Router();

financesRoutes.use(requireAuth);

financesRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(financesController.list));
financesRoutes.post('/', requireRole('transporter'), asyncHandler(financesController.create));
