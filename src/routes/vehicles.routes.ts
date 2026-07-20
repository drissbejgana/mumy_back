import { Router } from 'express';
import * as vehiclesController from '../controllers/vehicles.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const vehiclesRoutes = Router();

vehiclesRoutes.use(requireAuth);

vehiclesRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(vehiclesController.list));
vehiclesRoutes.post('/', requireRole('transporter'), asyncHandler(vehiclesController.create));
vehiclesRoutes.patch('/:id', requireRole('transporter', 'admin'), asyncHandler(vehiclesController.update));
vehiclesRoutes.delete('/:id', requireRole('transporter', 'admin'), asyncHandler(vehiclesController.remove));
vehiclesRoutes.post('/:id/maintenance-logs', requireRole('transporter'), asyncHandler(vehiclesController.addMaintenanceLog));
vehiclesRoutes.post('/:id/fuel-logs', requireRole('transporter'), asyncHandler(vehiclesController.addFuelLog));
