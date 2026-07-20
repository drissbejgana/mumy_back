import { Router } from 'express';
import * as controller from '../controllers/excursionBookings.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const excursionBookingsRoutes = Router();

excursionBookingsRoutes.get('/', requireAuth, requireRole('transporter', 'admin'), asyncHandler(controller.list));
excursionBookingsRoutes.post('/', optionalAuth, asyncHandler(controller.create));
