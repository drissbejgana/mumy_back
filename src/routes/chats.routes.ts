import { Router } from 'express';
import * as controller from '../controllers/chats.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const chatsRoutes = Router();

chatsRoutes.use(requireAuth, requireRole('transporter', 'admin'));
chatsRoutes.get('/', asyncHandler(controller.list));
chatsRoutes.post('/', asyncHandler(controller.create));
