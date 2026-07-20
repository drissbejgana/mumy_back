import type { Request, Response } from 'express';
import { ClientSupplier } from '../models/ClientSupplier.model';
import { ensureOwnership } from '../middleware/requireOwnership';
import { HttpError } from '../utils/HttpError';

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  const items = await ClientSupplier.find(filter).sort({ createdAt: -1 });
  res.json(items.map((i) => i.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const item = await ClientSupplier.create({ ...req.body, transporterId: req.user!.sub });
  res.status(201).json(item.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const item = await ClientSupplier.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Entrée introuvable.');
  ensureOwnership(req, item.transporterId);
  Object.assign(item, req.body);
  await item.save();
  res.json(item.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const item = await ClientSupplier.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Entrée introuvable.');
  ensureOwnership(req, item.transporterId);
  await item.deleteOne();
  res.status(204).send();
}
