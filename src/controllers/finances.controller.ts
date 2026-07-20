import type { Request, Response } from 'express';
import { FinancialRecord } from '../models/FinancialRecord.model';

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' && req.query.transporterId ? { transporterId: req.query.transporterId } : req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  const records = await FinancialRecord.find(filter).sort({ date: -1 });
  res.json(records.map((r) => r.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const record = await FinancialRecord.create({ ...req.body, transporterId: req.user!.sub });
  res.status(201).json(record.toJSON());
}
