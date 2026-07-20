import { Router } from 'express';
import * as controller from '../controllers/banners.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const bannersRoutes = Router();

bannersRoutes.get('/', optionalAuth, asyncHandler(controller.list));
bannersRoutes.post('/', requireAuth, requireRole('admin'), asyncHandler(controller.create));
bannersRoutes.patch('/:id', requireAuth, requireRole('admin'), asyncHandler(controller.update));
bannersRoutes.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(controller.remove));
bannersRoutes.post('/:id/impression', optionalAuth, asyncHandler(controller.registerImpression));
bannersRoutes.post('/:id/click', optionalAuth, asyncHandler(controller.registerClick));
