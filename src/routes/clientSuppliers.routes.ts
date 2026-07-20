import { Router } from 'express';
import * as controller from '../controllers/clientSuppliers.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const clientSuppliersRoutes = Router();

clientSuppliersRoutes.use(requireAuth);

clientSuppliersRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(controller.list));
clientSuppliersRoutes.post('/', requireRole('transporter'), asyncHandler(controller.create));
clientSuppliersRoutes.patch('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.update));
clientSuppliersRoutes.delete('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.remove));
