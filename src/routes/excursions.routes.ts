import { Router } from 'express';
import * as controller from '../controllers/excursions.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { optionalAuth } from '../middleware/optionalAuth';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const excursionsRoutes = Router();

excursionsRoutes.get('/', optionalAuth, asyncHandler(controller.list));
excursionsRoutes.post('/', requireAuth, requireRole('transporter'), asyncHandler(controller.create));
excursionsRoutes.patch('/:id', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.update));
excursionsRoutes.delete('/:id', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.remove));
