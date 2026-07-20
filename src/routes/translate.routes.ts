import { Router } from 'express';
import * as controller from '../controllers/translate.controller';
import { asyncHandler } from '../middleware/asyncHandler';

export const translateRoutes = Router();

// Left auth-optional: used from the LoginScreen and by the DOM-walking i18n layer before login.
translateRoutes.post('/', asyncHandler(controller.translate));
