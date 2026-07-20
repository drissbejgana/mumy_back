import type { Request, Response } from 'express';
import { SentimentAlert } from '../models/SentimentAlert.model.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const alerts = await SentimentAlert.find().sort({ createdAt: -1 });
  res.json(alerts.map((a) => a.toJSON()));
}
