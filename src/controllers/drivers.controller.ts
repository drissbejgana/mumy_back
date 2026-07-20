import type { Request, Response } from 'express';
import { Driver } from '../models/Driver.model';
import { ensureOwnership } from '../middleware/requireOwnership';
import { HttpError } from '../utils/HttpError';

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' && req.query.transporterId ? { transporterId: req.query.transporterId } : req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  const drivers = await Driver.find(filter).sort({ createdAt: -1 });
  res.json(drivers.map((d) => d.toJSON()));
}

export async function me(req: Request, res: Response): Promise<void> {
  const driver = await Driver.findOne({ linkedUserId: req.user!.sub });
  if (!driver) throw new HttpError(404, "Aucun profil chauffeur lié à ce compte.");
  res.json(driver.toJSON());
}

export async function create(req: Request, res: Response): Promise<void> {
  const driver = await Driver.create({ ...req.body, transporterId: req.user!.sub });
  res.status(201).json(driver.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new HttpError(404, 'Chauffeur introuvable.');
  ensureOwnership(req, driver.transporterId);
  Object.assign(driver, req.body);
  await driver.save();
  res.json(driver.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new HttpError(404, 'Chauffeur introuvable.');
  ensureOwnership(req, driver.transporterId);
  await driver.deleteOne();
  res.status(204).send();
}
