import { Router } from 'express';
import * as controller from '../controllers/translate.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const translateRoutes = Router();

// Left auth-optional: used from the LoginScreen and by the DOM-walking i18n layer before login.
translateRoutes.post('/', asyncHandler(controller.translate));
