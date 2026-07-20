import { Router } from 'express';
import * as controller from '../controllers/sentimentAlerts.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const sentimentAlertsRoutes = Router();

sentimentAlertsRoutes.use(requireAuth, requireRole('admin'));
sentimentAlertsRoutes.get('/', asyncHandler(controller.list));
