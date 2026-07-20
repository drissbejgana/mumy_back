import { Router } from 'express';
import * as bidsController from '../controllers/bids.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const bidsRoutes = Router();

bidsRoutes.use(requireAuth);

bidsRoutes.get('/', asyncHandler(bidsController.list));
bidsRoutes.post('/', requireRole('transporter'), asyncHandler(bidsController.create));
bidsRoutes.post('/:id/accept', requireRole('client'), asyncHandler(bidsController.accept));
