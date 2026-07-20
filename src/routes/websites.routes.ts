import { Router } from 'express';
import * as controller from '../controllers/websites.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const websitesRoutes = Router();

websitesRoutes.get('/', asyncHandler(controller.list));
websitesRoutes.get('/:transporterId', asyncHandler(controller.getOne));
websitesRoutes.put('/:transporterId', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.upsert));
