import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { EmptyReturn } from '../models/EmptyReturn.model.js';
import { TransportRequest } from '../models/TransportRequest.model.js';
import { FinancialRecord } from '../models/FinancialRecord.model.js';
import { User } from '../models/User.model.js';
import { HttpError } from '../utils/HttpError.js';

const COMMISSION_RATE = 0.2;

export async function list(_req: Request, res: Response): Promise<void> {
  const emptyReturns = await EmptyReturn.find({ status: 'available' }).sort({ dateTime: 1 });
  res.json(emptyReturns.map((e) => e.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const transporter = await User.findById(req.user!.sub);
  if (!transporter) throw new HttpError(404, 'Utilisateur introuvable.');

  const emptyReturn = await EmptyReturn.create({
    ...req.body,
    transporterId: transporter.id,
    transporterName: transporter.companyName || transporter.name,
    status: 'available',
  });
  res.status(201).json(emptyReturn.toJSON());
}

export async function book(req: Request, res: Response): Promise<void> {
  const client = await User.findById(req.user!.sub);
  if (!client) throw new HttpError(404, 'Utilisateur introuvable.');

  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      // Conditional update on status='available' is the atomicity guard against double-booking.
      const emptyReturn = await EmptyReturn.findOneAndUpdate(
        { _id: req.params.id, status: 'available' },
        { status: 'booked' },
        { new: true, session }
      );
      if (!emptyReturn) throw new HttpError(409, 'Ce trajet retour à vide vient d\'être réservé par quelqu\'un d\'autre.');

      const commission = emptyReturn.basePriceDHS * COMMISSION_RATE;
      const finalPriceDHS = emptyReturn.basePriceDHS + commission;

      const [request] = await TransportRequest.create(
        [
          {
            clientId: client.id,
            clientName: client.companyName || client.name,
            passengerName: req.body?.passengerName || 'Client Mumy',
            origin: emptyReturn.origin,
            destination: emptyReturn.destination,
            dateTime: emptyReturn.dateTime,
            paxCount: req.body?.paxCount || 1,
            serviceType: 'simple',
            status: 'accepted',
            transporterId: emptyReturn.transporterId,
            priceDHS: finalPriceDHS,
          },
        ],
        { session }
      );

      await FinancialRecord.create(
        [
          {
            transporterId: emptyReturn.transporterId,
            date: new Date(),
            type: 'revenue',
            amount: finalPriceDHS,
            label: `Retour à vide ${emptyReturn.origin} → ${emptyReturn.destination}`,
            category: 'Retour à Vide',
          },
        ],
        { session }
      );

      result = { emptyReturn: emptyReturn.toJSON(), request: request.toJSON() };
    });
    res.json(result);
  } finally {
    await session.endSession();
  }
}
