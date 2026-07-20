import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/tokenService.js';

// Like requireAuth, but never rejects — attaches req.user only if a valid token is present.
// Used by routes that are public but personalize the response for a logged-in caller.
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice('Bearer '.length));
    } catch {
      // ignore invalid/expired token on optional routes
    }
  }
  next();
}
