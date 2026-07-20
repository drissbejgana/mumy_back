import { Router } from 'express';
import * as controller from '../controllers/teamMembers.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const teamMembersRoutes = Router();

teamMembersRoutes.use(requireAuth);

teamMembersRoutes.get('/', requireRole('transporter', 'admin'), asyncHandler(controller.list));
teamMembersRoutes.post('/', requireRole('transporter', 'admin'), asyncHandler(controller.create));
teamMembersRoutes.patch('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.update));
teamMembersRoutes.delete('/:id', requireRole('transporter', 'admin'), asyncHandler(controller.remove));
