import { Router } from 'express';
import * as bidsController from '../controllers/bids.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const bidsRoutes = Router();

bidsRoutes.use(requireAuth);

bidsRoutes.get('/', asyncHandler(bidsController.list));
bidsRoutes.post('/', requireRole('transporter'), asyncHandler(bidsController.create));
bidsRoutes.post('/:id/accept', requireRole('client'), asyncHandler(bidsController.accept));
