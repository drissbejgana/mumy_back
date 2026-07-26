import type { Request, Response } from 'express';
import { BusinessDocument } from '../models/BusinessDocument.model.js';
import { ensureOwnership } from '../middleware/requireOwnership.js';
import { HttpError } from '../utils/HttpError.js';

const PREFIXES: Record<string, string> = {
  Devis: 'DEV',
  Facture: 'FACT',
  'Bon de commande': 'BC',
  'Facture Proforma': 'PRO',
};

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  const docs = await BusinessDocument.find(filter).sort({ createdAt: -1 });
  res.json(docs.map((d) => d.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { docType, partnerName, items } = req.body ?? {};
  if (!docType || !PREFIXES[docType]) throw new HttpError(400, 'Type de document invalide.');
  if (!partnerName) throw new HttpError(400, 'Veuillez sélectionner un partenaire.');
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'Ajoutez au moins une ligne de prestation.');
  }

  // Totals are computed server-side so a document can't be issued with figures that don't
  // add up, whatever the client sends.
  const subtotal = items.reduce(
    (acc: number, item: any) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const tvaRate = Number(req.body.tvaRate ?? 20);
  const tvaAmount = subtotal * (tvaRate / 100);

  const doc = await BusinessDocument.create({
    ...req.body,
    transporterId: req.user!.sub,
    reference: `${PREFIXES[docType]}-${Math.floor(10000 + Math.random() * 90000)}`,
    items,
    tvaRate,
    subtotal,
    tvaAmount,
    totalTtc: subtotal + tvaAmount,
    status: 'created',
    sharedWith: null,
  });

  res.status(201).json(doc.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const doc = await BusinessDocument.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Document introuvable.');
  ensureOwnership(req, doc.transporterId);

  // Only the sharing lifecycle is mutable; the issued figures are immutable by design.
  if (req.body?.status !== undefined) doc.status = req.body.status;
  if (req.body?.sharedWith !== undefined) doc.sharedWith = req.body.sharedWith;
  await doc.save();

  res.json(doc.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const doc = await BusinessDocument.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Document introuvable.');
  ensureOwnership(req, doc.transporterId);
  await doc.deleteOne();
  res.status(204).send();
}
