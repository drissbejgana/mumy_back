import type { Request, Response } from 'express';
import { Excursion } from '../models/Excursion.model.js';
import { ensureOwnership } from '../middleware/requireOwnership.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(req: Request, res: Response): Promise<void> {
  const user = req.user;
  let filter: Record<string, unknown> = { isActive: true };
  if (user?.role === 'transporter') filter = { transporterId: user.sub };
  else if (user?.role === 'admin') filter = {};

  const excursions = await Excursion.find(filter).sort({ createdAt: -1 });
  res.json(excursions.map((e) => e.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const excursion = await Excursion.create({ ...req.body, transporterId: req.user!.sub });
  res.status(201).json(excursion.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const excursion = await Excursion.findById(req.params.id);
  if (!excursion) throw new HttpError(404, 'Excursion introuvable.');
  ensureOwnership(req, excursion.transporterId);
  Object.assign(excursion, req.body);
  await excursion.save();
  res.json(excursion.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const excursion = await Excursion.findById(req.params.id);
  if (!excursion) throw new HttpError(404, 'Excursion introuvable.');
  ensureOwnership(req, excursion.transporterId);
  await excursion.deleteOne();
  res.status(204).send();
}
