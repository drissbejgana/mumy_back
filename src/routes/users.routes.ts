import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

export const usersRoutes = Router();

usersRoutes.use(requireAuth);

usersRoutes.get('/', asyncHandler(usersController.list));
usersRoutes.post('/', requireRole('admin'), asyncHandler(usersController.create));
usersRoutes.get('/:id', asyncHandler(usersController.getOne));
usersRoutes.patch('/:id', asyncHandler(usersController.update));
usersRoutes.post('/:id/verify', requireRole('admin'), asyncHandler(usersController.verify));
usersRoutes.post('/:id/ban', requireRole('admin'), asyncHandler(usersController.ban));
