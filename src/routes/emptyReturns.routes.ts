import { Router } from 'express';
import * as emptyReturnsController from '../controllers/emptyReturns.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const emptyReturnsRoutes = Router();

emptyReturnsRoutes.use(requireAuth);

emptyReturnsRoutes.get('/', asyncHandler(emptyReturnsController.list));
emptyReturnsRoutes.post('/', requireRole('transporter'), asyncHandler(emptyReturnsController.create));
emptyReturnsRoutes.post('/:id/book', requireRole('client'), asyncHandler(emptyReturnsController.book));
