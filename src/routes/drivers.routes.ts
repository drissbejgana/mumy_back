import { Router } from 'express';
import * as driversController from '../controllers/drivers.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const driversRoutes = Router();

driversRoutes.use(requireAuth);

driversRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(driversController.list));
driversRoutes.get('/me', requireRole('driver'), asyncHandler(driversController.me));
driversRoutes.post('/', requireRole('transporter'), asyncHandler(driversController.create));
driversRoutes.patch('/:id', requireRole('transporter', 'admin'), asyncHandler(driversController.update));
driversRoutes.delete('/:id', requireRole('transporter', 'admin'), asyncHandler(driversController.remove));
