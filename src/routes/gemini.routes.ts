import { Router } from 'express';
import * as controller from '../controllers/gemini.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const geminiRoutes = Router();

geminiRoutes.use(requireAuth);

geminiRoutes.post('/assistant', requireRole('admin'), asyncHandler(controller.assistant));
geminiRoutes.post('/audit', requireRole('admin'), asyncHandler(controller.audit));
geminiRoutes.post('/yield', requireRole('transporter'), asyncHandler(controller.yieldAdvice));
