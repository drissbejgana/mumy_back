import type { Request, Response } from 'express';
import { TransporterWebsite } from '../models/TransporterWebsite.model.js';
import { ensureOwnership } from '../middleware/requireOwnership.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const sites = await TransporterWebsite.find();
  res.json(sites.map((s) => s.toJSON()));
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const site = await TransporterWebsite.findOne({ transporterId: req.params.transporterId });
  if (!site) throw new HttpError(404, 'Site introuvable.');
  res.json(site.toJSON());
}

// True upsert — fixes the original app's bug where creating a brand-new site never
// reflected back into client state (see App.tsx handleUpdateWebsite).
export async function upsert(req: Request, res: Response): Promise<void> {
  ensureOwnership(req, req.params.transporterId);
  const site = await TransporterWebsite.findOneAndUpdate(
    { transporterId: req.params.transporterId },
    { ...req.body, transporterId: req.params.transporterId },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json(site.toJSON());
}
