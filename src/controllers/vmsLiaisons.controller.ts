import type { Request, Response } from 'express';
import { VmsLiaison } from '../models/VmsLiaison.model.js';
import { ensureOwnership } from '../middleware/requireOwnership.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> =
    req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  if (req.query.date) filter.date = req.query.date;

  const liaisons = await VmsLiaison.find(filter).sort({ date: 1, startTime: 1 });
  res.json(liaisons.map((l) => l.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { driverId, vehicleId } = req.body ?? {};
  if (!driverId || !vehicleId) {
    throw new HttpError(400, 'Veuillez sélectionner un chauffeur et un véhicule.');
  }

  const liaison = await VmsLiaison.create({ ...req.body, transporterId: req.user!.sub });
  res.status(201).json(liaison.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const liaison = await VmsLiaison.findById(req.params.id);
  if (!liaison) throw new HttpError(404, 'Liaison VMS introuvable.');
  ensureOwnership(req, liaison.transporterId);
  Object.assign(liaison, req.body);
  await liaison.save();
  res.json(liaison.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const liaison = await VmsLiaison.findById(req.params.id);
  if (!liaison) throw new HttpError(404, 'Liaison VMS introuvable.');
  ensureOwnership(req, liaison.transporterId);
  await liaison.deleteOne();
  res.status(204).send();
}
