import { rateLimit } from 'express-rate-limit';

// General API traffic — generous limit to support frequent polling (React Query refetch intervals).
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de requêtes détectées de votre part. Veuillez réessayer plus tard.' },
});

// Stricter limit on login specifically, to blunt credential-stuffing attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.' },
});
