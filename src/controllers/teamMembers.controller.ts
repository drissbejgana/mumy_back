import type { Request, Response } from 'express';
import { TeamMember } from '../models/TeamMember.model';
import { ensureOwnership } from '../middleware/requireOwnership';
import { HttpError } from '../utils/HttpError';

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' ? { transporterId: null } : { transporterId: req.user!.sub };
  const members = await TeamMember.find(filter).sort({ createdAt: 1 });
  res.json(members.map((m) => m.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const transporterId = req.user!.role === 'admin' ? null : req.user!.sub;
  const member = await TeamMember.create({ ...req.body, transporterId });
  res.status(201).json(member.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const member = await TeamMember.findById(req.params.id);
  if (!member) throw new HttpError(404, 'Membre introuvable.');
  if (req.user!.role !== 'admin') {
    ensureOwnership(req, member.transporterId);
  }
  Object.assign(member, req.body);
  await member.save();
  res.json(member.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const member = await TeamMember.findById(req.params.id);
  if (!member) throw new HttpError(404, 'Membre introuvable.');
  if (req.user!.role !== 'admin') {
    ensureOwnership(req, member.transporterId);
  }
  await member.deleteOne();
  res.status(204).send();
}
