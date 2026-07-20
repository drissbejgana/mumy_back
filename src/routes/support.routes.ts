import { Router } from 'express';
import * as controller from '../controllers/support.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const supportRoutes = Router();

supportRoutes.use(requireAuth);

supportRoutes.get('/sessions', requireRole('admin'), asyncHandler(controller.listSessions));
supportRoutes.post('/session', requireRole('transporter', 'client', 'admin'), asyncHandler(controller.getOrInitSession));
supportRoutes.post('/message', requireRole('transporter', 'client', 'admin'), asyncHandler(controller.postMessage));
