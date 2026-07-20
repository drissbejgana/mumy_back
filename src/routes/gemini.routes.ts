import { Router } from 'express';
import * as controller from '../controllers/gemini.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const geminiRoutes = Router();

geminiRoutes.use(requireAuth);

geminiRoutes.post('/assistant', requireRole('admin'), asyncHandler(controller.assistant));
geminiRoutes.post('/audit', requireRole('admin'), asyncHandler(controller.audit));
geminiRoutes.post('/yield', requireRole('transporter'), asyncHandler(controller.yieldAdvice));
