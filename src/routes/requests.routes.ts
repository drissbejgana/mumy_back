import { Router } from 'express';
import * as requestsController from '../controllers/requests.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const requestsRoutes = Router();

requestsRoutes.use(requireAuth);

requestsRoutes.get('/', asyncHandler(requestsController.list));
requestsRoutes.get('/:id', asyncHandler(requestsController.getOne));
requestsRoutes.post('/', requireRole('client'), asyncHandler(requestsController.create));
requestsRoutes.patch('/:id/assign-driver', requireRole('transporter', 'admin'), asyncHandler(requestsController.assignDriver));
requestsRoutes.patch('/:id/status', requireRole('transporter', 'driver', 'admin'), asyncHandler(requestsController.updateStatus));
requestsRoutes.post('/:id/rating', requireRole('client'), asyncHandler(requestsController.rate));
requestsRoutes.post('/:id/flag-review', requireRole('admin'), asyncHandler(requestsController.flagReview));
