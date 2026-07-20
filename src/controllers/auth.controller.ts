import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import type { Request, Response } from 'express';
import { User } from '../models/User.model';
import { signToken } from '../services/tokenService';
import { HttpError } from '../utils/HttpError';
import { env } from '../config/env';

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

function issueSession(user: InstanceType<typeof User>) {
  const token = signToken({ sub: user.id, role: user.role as any, email: user.email });
  const sanitized = user.toJSON() as any;
  delete sanitized.passwordHash;
  return { token, user: sanitized };
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    throw new HttpError(400, 'Email et mot de passe requis.');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Identifiants invalides.');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Identifiants invalides.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json(issueSession(user));
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  if (!googleClient) {
    throw new HttpError(503, "La connexion Google n'est pas configurée sur ce serveur.");
  }

  const { credential } = req.body ?? {};
  if (!credential) {
    throw new HttpError(400, 'credential requis.');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Jeton Google invalide.');
  }

  if (!payload?.email || !payload.email_verified) {
    throw new HttpError(401, 'Compte Google non vérifié.');
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });

  if (!user) {
    // No existing account for this email — self-provision a client account (lowest-trust
    // role, no KYC gate). Transporter/driver/admin accounts must already exist; Google
    // login only ever links to them, never creates them.
    user = await User.create({
      name: payload.name || email,
      email,
      role: 'client',
      status: 'verified',
      avatarUrl: payload.picture,
      googleId: payload.sub,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json(issueSession(user));
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.sub);
  if (!user) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }
  res.json(user.toJSON());
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ ok: true });
}
