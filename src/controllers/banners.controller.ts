import type { Request, Response } from 'express';
import { AdBanner } from '../models/AdBanner.model.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(req: Request, res: Response): Promise<void> {
  // Admins manage the full catalog (including inactive/paused banners); everyone else
  // only ever sees banners that are currently live.
  const filter: Record<string, unknown> = req.user?.role === 'admin' ? {} : { isActive: true };
  if (req.query.targetRole) filter.targetRole = { $in: [req.query.targetRole, 'all'] };
  const banners = await AdBanner.find(filter).sort({ createdAt: -1 });
  res.json(banners.map((b) => b.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const banner = await AdBanner.create({ ...req.body, spent: 0, impressions: 0, clicks: 0 });
  res.status(201).json(banner.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const banner = await AdBanner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) throw new HttpError(404, 'Bannière introuvable.');
  res.json(banner.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const banner = await AdBanner.findByIdAndDelete(req.params.id);
  if (!banner) throw new HttpError(404, 'Bannière introuvable.');
  res.status(204).send();
}

export async function registerImpression(req: Request, res: Response): Promise<void> {
  const banner = await AdBanner.findById(req.params.id);
  if (!banner) throw new HttpError(404, 'Bannière introuvable.');
  if (!banner.isActive) {
    res.json(banner.toJSON());
    return;
  }

  const addedSpent = banner.optimizationType === 'cpm' ? banner.cpmValue / 1000 : 0;
  const nextSpent = Math.min(banner.spent + addedSpent, banner.budget);
  const shouldDeactivate = nextSpent >= banner.budget && banner.optimizationType !== 'weekly' && banner.optimizationType !== 'monthly';

  const updated = await AdBanner.findByIdAndUpdate(
    req.params.id,
    { $inc: { impressions: 1 }, $set: { spent: nextSpent, isActive: !shouldDeactivate } },
    { new: true }
  );
  res.json(updated!.toJSON());
}

export async function registerClick(req: Request, res: Response): Promise<void> {
  const banner = await AdBanner.findById(req.params.id);
  if (!banner) throw new HttpError(404, 'Bannière introuvable.');
  if (!banner.isActive) {
    res.json(banner.toJSON());
    return;
  }

  const addedSpent = banner.optimizationType === 'cpc' ? banner.cpcValue : 0;
  const nextSpent = Math.min(banner.spent + addedSpent, banner.budget);
  const shouldDeactivate = nextSpent >= banner.budget && banner.optimizationType !== 'weekly' && banner.optimizationType !== 'monthly';

  const updated = await AdBanner.findByIdAndUpdate(
    req.params.id,
    { $inc: { clicks: 1 }, $set: { spent: nextSpent, isActive: !shouldDeactivate } },
    { new: true }
  );
  res.json(updated!.toJSON());
}
