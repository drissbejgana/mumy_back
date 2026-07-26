import { Router } from 'express';
import * as requestsController from '../controllers/requests.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const requestsRoutes = Router();

requestsRoutes.use(requireAuth);

requestsRoutes.get('/', asyncHandler(requestsController.list));
requestsRoutes.get('/:id', asyncHandler(requestsController.getOne));
// Transporters post here too, to record a "direct lead" they booked off-platform.
requestsRoutes.post('/', requireRole('client', 'transporter'), asyncHandler(requestsController.create));
requestsRoutes.patch('/:id', requireRole('transporter', 'driver', 'admin'), asyncHandler(requestsController.updateDetails));
requestsRoutes.patch('/:id/assign-driver', requireRole('transporter', 'admin'), asyncHandler(requestsController.assignDriver));
requestsRoutes.patch('/:id/status', requireRole('transporter', 'driver', 'admin'), asyncHandler(requestsController.updateStatus));
requestsRoutes.post('/:id/rating', requireRole('client'), asyncHandler(requestsController.rate));
requestsRoutes.post('/:id/flag-review', requireRole('admin'), asyncHandler(requestsController.flagReview));
