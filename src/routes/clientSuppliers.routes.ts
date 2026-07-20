import { Router } from 'express';
import * as controller from '../controllers/clientSuppliers.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const clientSuppliersRoutes = Router();

clientSuppliersRoutes.use(requireAuth);

clientSuppliersRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(controller.list));
clientSuppliersRoutes.post('/', requireRole('transporter'), asyncHandler(controller.create));
clientSuppliersRoutes.patch('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.update));
clientSuppliersRoutes.delete('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.remove));
