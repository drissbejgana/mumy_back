import { Router } from 'express';
import * as controller from '../controllers/excursions.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const excursionsRoutes = Router();

excursionsRoutes.get('/', optionalAuth, asyncHandler(controller.list));
excursionsRoutes.post('/', requireAuth, requireRole('transporter'), asyncHandler(controller.create));
excursionsRoutes.patch('/:id', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.update));
excursionsRoutes.delete('/:id', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.remove));
