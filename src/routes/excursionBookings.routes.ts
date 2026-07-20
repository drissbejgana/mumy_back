import { Router } from 'express';
import * as controller from '../controllers/excursionBookings.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { optionalAuth } from '../middleware/optionalAuth';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const excursionBookingsRoutes = Router();

excursionBookingsRoutes.get('/', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.list));
excursionBookingsRoutes.post('/', optionalAuth, asyncHandler(controller.create));
