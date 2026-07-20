import { Router } from 'express';
import * as emptyReturnsController from '../controllers/emptyReturns.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const emptyReturnsRoutes = Router();

emptyReturnsRoutes.use(requireAuth);

emptyReturnsRoutes.get('/', asyncHandler(emptyReturnsController.list));
emptyReturnsRoutes.post('/', requireRole('transporter'), asyncHandler(emptyReturnsController.create));
emptyReturnsRoutes.post('/:id/book', requireRole('client'), asyncHandler(emptyReturnsController.book));
