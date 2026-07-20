import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const usersRoutes = Router();

usersRoutes.use(requireAuth);

usersRoutes.get('/', asyncHandler(usersController.list));
usersRoutes.post('/', requireRole('admin'), asyncHandler(usersController.create));
usersRoutes.get('/:id', asyncHandler(usersController.getOne));
usersRoutes.patch('/:id', asyncHandler(usersController.update));
usersRoutes.post('/:id/verify', requireRole('admin'), asyncHandler(usersController.verify));
usersRoutes.post('/:id/ban', requireRole('admin'), asyncHandler(usersController.ban));
