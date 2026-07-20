import { Router } from 'express';
import * as controller from '../controllers/teamMembers.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const teamMembersRoutes = Router();

teamMembersRoutes.use(requireAuth);

teamMembersRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(controller.list));
teamMembersRoutes.post('/', requireRole('transporter', 'admin'), asyncHandler(controller.create));
teamMembersRoutes.patch('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.update));
teamMembersRoutes.delete('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.remove));
