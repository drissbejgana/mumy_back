import type { Request } from 'express';
import { HttpError } from '../utils/HttpError.js';

// Throws 403 unless the caller is admin or owns the resource (its transporterId === req.user.id).
// Call after loading the resource, inside the controller, since ownership is per-document.
export function ensureOwnership(req: Request, resourceTransporterId: unknown): void {
  if (!req.user) {
    throw new HttpError(401, 'Authentification requise.');
  }
  if (req.user.role === 'admin') {
    return;
  }
  if (!resourceTransporterId || resourceTransporterId.toString() !== req.user.sub) {
    throw new HttpError(403, "Vous n'avez pas accès à cette ressource.");
  }
}
