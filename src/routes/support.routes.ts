import { Router } from 'express';
import * as controller from '../controllers/support.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const supportRoutes = Router();

supportRoutes.use(requireAuth);

supportRoutes.get('/sessions', requireRole('admin'), asyncHandler(controller.listSessions));
supportRoutes.post('/session', requireRole('transporter', 'client', 'admin'), asyncHandler(controller.getOrInitSession));
supportRoutes.post('/message', requireRole('transporter', 'client', 'admin'), asyncHandler(controller.postMessage));
