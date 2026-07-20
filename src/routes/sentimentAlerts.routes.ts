import { Router } from 'express';
import * as controller from '../controllers/sentimentAlerts.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const sentimentAlertsRoutes = Router();

sentimentAlertsRoutes.use(requireAuth, requireRole('admin'));
sentimentAlertsRoutes.get('/', asyncHandler(controller.list));
