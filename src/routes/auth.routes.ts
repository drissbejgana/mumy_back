import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authLimiter } from '../middleware/rateLimiters';
import { requireAuth } from '../middleware/requireAuth';

export const authRoutes = Router();

authRoutes.post('/login', authLimiter, asyncHandler(authController.login));
authRoutes.post('/google', authLimiter, asyncHandler(authController.googleLogin));
authRoutes.get('/me', requireAuth, asyncHandler(authController.me));
authRoutes.post('/logout', requireAuth, asyncHandler(authController.logout));
