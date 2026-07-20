import type { Request, Response } from 'express';
import { User } from '../models/User.model';
import { HttpError } from '../utils/HttpError';

const PUBLIC_FIELDS = ['id', 'name', 'companyName', 'avatarUrl', 'role', 'status', 'isFeatured'] as const;

export async function list(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  const users = await User.find(filter).sort({ createdAt: -1 });

  if (req.user!.role === 'admin') {
    res.json(users.map((u) => u.toJSON()));
    return;
  }

  // Non-admins only need enough to render transporter/client badges (e.g. "featured" flags) —
  // never expose email, phone, KYC documents, or risk history to other tenants.
  res.json(
    users.map((u) => {
      const json = u.toJSON() as any;
      return Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, json[field]]));
    })
  );
}

export async function getOne(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== 'admin' && req.user!.sub !== req.params.id) {
    throw new HttpError(403, "Vous n'avez pas accès à ce profil.");
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'Utilisateur introuvable.');
  res.json(user.toJSON());
}

const SELF_EDITABLE_FIELDS = [
  'name',
  'phone',
  'avatarUrl',
  'companyName',
  'kycDocUrl',
  'kycUploadedAt',
  'ice',
  'patente',
  'rc',
  'ifFiscal',
  'cnss',
  'kycLicenceUrl',
  'kycRcUrl',
  'kycInsuranceUrl',
  'kycPatenteUrl',
];

export async function update(req: Request, res: Response): Promise<void> {
  const isSelf = req.user!.sub === req.params.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isSelf && !isAdmin) {
    throw new HttpError(403, "Vous n'avez pas accès à ce profil.");
  }

  const updates = isAdmin
    ? req.body
    : Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => SELF_EDITABLE_FIELDS.includes(key)));

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'Utilisateur introuvable.');
  res.json(user.toJSON());
}

export async function create(req: Request, res: Response): Promise<void> {
  const bcrypt = await import('bcryptjs');
  const { password, ...rest } = req.body ?? {};
  if (!password) throw new HttpError(400, 'Mot de passe requis.');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ ...rest, email: String(rest.email).toLowerCase(), passwordHash });
  res.status(201).json(user.toJSON());
}

export async function verify(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      status: 'verified',
      kycLicenceStatus: 'verified',
      kycRcStatus: 'verified',
      kycInsuranceStatus: 'verified',
      kycPatenteStatus: 'verified',
    },
    { new: true }
  );
  if (!user) throw new HttpError(404, 'Utilisateur introuvable.');
  res.json(user.toJSON());
}

export async function ban(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
  if (!user) throw new HttpError(404, 'Utilisateur introuvable.');
  res.json(user.toJSON());
}
