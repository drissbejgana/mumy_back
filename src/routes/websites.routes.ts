import { Router } from 'express';
import * as controller from '../controllers/websites.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const websitesRoutes = Router();

websitesRoutes.get('/', asyncHandler(controller.list));
websitesRoutes.get('/:transporterId', asyncHandler(controller.getOne));
websitesRoutes.put('/:transporterId', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.upsert));
