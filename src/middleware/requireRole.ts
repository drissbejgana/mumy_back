import type { NextFunction, Request, Response } from 'express';
import type { User } from '../shared-types.js';

export function requireRole(...roles: User['role'][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action." });
      return;
    }
    next();
  };
}
