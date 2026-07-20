import { Router } from 'express';
import * as controller from '../controllers/track.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const trackRoutes = Router();

// Public, unauthenticated. Banner interactions on this page use the already-public
// POST /api/banners/:id/impression and /:id/click routes directly (bannerId comes from
// the `banners` array in this response) — no separate impression/click route needed here.
trackRoutes.get('/:requestId', asyncHandler(controller.getTracking));
