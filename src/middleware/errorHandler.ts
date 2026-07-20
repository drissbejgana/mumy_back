import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'ValidationError') {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
}
