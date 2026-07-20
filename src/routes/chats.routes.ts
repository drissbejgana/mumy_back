import { Router } from 'express';
import * as controller from '../controllers/chats.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const chatsRoutes = Router();

chatsRoutes.use(requireAuth, requireRole('transporter', 'admin'));
chatsRoutes.get('/', asyncHandler(controller.list));
chatsRoutes.post('/', asyncHandler(controller.create));
