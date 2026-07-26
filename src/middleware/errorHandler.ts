import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'ValidationError') {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
  // A malformed ObjectId in a URL or body is a client mistake, not a server fault.
  if (err && typeof err === 'object' && (err as any).name === 'CastError') {
    res.status(400).json({ error: `Identifiant ou valeur invalide : ${(err as any).path}.` });
    return;
  }
  // Unique-index violation (duplicate email, duplicate plate for the same transporter…).
  // Surfaced explicitly so the form shows the real reason instead of a generic 500.
  if (err && typeof err === 'object' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern ?? {}).join(', ');
    res.status(409).json({
      error: field
        ? `Cette valeur existe déjà et doit être unique (${field}).`
        : 'Cet enregistrement existe déjà.',
    });
    return;
  }
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
}
