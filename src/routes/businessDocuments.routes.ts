import { Router } from 'express';
import * as controller from '../controllers/businessDocuments.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const businessDocumentsRoutes = Router();

businessDocumentsRoutes.use(requireAuth, requireRole('transporter', 'admin'));

businessDocumentsRoutes.get('/', asyncHandler(controller.list));
businessDocumentsRoutes.post('/', asyncHandler(controller.create));
businessDocumentsRoutes.patch('/:id', asyncHandler(controller.update));
businessDocumentsRoutes.delete('/:id', asyncHandler(controller.remove));
