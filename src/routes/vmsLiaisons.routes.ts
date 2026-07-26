import { Router } from 'express';
import * as controller from '../controllers/vmsLiaisons.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const vmsLiaisonsRoutes = Router();

vmsLiaisonsRoutes.use(requireAuth, requireRole('transporter', 'admin'));

vmsLiaisonsRoutes.get('/', asyncHandler(controller.list));
vmsLiaisonsRoutes.post('/', asyncHandler(controller.create));
vmsLiaisonsRoutes.patch('/:id', asyncHandler(controller.update));
vmsLiaisonsRoutes.delete('/:id', asyncHandler(controller.remove));
