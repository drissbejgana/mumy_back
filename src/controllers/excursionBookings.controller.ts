import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { ExcursionBooking } from '../models/ExcursionBooking.model.js';
import { Excursion } from '../models/Excursion.model.js';
import { TransportRequest } from '../models/TransportRequest.model.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  const bookings = await ExcursionBooking.find(filter).sort({ createdAt: -1 });
  res.json(bookings.map((b) => b.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { excursionId, clientName, clientEmail, clientPhone, date, paxCount } = req.body ?? {};
  if (!excursionId || !clientName || !date || !paxCount) {
    throw new HttpError(400, 'excursionId, clientName, date et paxCount sont requis.');
  }

  const excursion = await Excursion.findById(excursionId);
  if (!excursion) throw new HttpError(404, 'Excursion introuvable.');

  const totalPriceDHS = excursion.priceDHS * Number(paxCount);

  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const [booking] = await ExcursionBooking.create(
        [
          {
            excursionId: excursion.id,
            excursionTitle: excursion.title,
            transporterId: excursion.transporterId,
            transporterName: excursion.transporterName,
            clientName,
            clientEmail,
            clientPhone,
            date,
            paxCount,
            totalPriceDHS,
            status: 'confirmed',
          },
        ],
        { session }
      );

      await TransportRequest.create(
        [
          {
            clientId: req.user?.role === 'client' ? req.user.sub : null,
            clientName,
            passengerName: clientName,
            origin: excursion.location,
            destination: excursion.title,
            dateTime: date,
            paxCount,
            serviceType: 'simple',
            status: 'pending',
            transporterId: excursion.transporterId,
            priceDHS: totalPriceDHS,
            notes: `Réservation excursion: ${excursion.title}`,
          },
        ],
        { session }
      );

      result = booking.toJSON();
    });
    res.status(201).json(result);
  } finally {
    await session.endSession();
  }
}
