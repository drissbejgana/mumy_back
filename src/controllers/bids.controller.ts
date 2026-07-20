import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { Bid } from '../models/Bid.model';
import { TransportRequest } from '../models/TransportRequest.model';
import { User } from '../models/User.model';
import { HttpError } from '../utils/HttpError';

export async function list(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};
  if (req.query.requestId) filter.requestId = req.query.requestId;
  if (req.user!.role === 'transporter') filter.transporterId = req.user!.sub;
  const bids = await Bid.find(filter).sort({ createdAt: -1 });
  res.json(bids.map((b) => b.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { requestId, priceDHS, vehicleType } = req.body ?? {};
  if (!requestId || !priceDHS || !vehicleType) {
    throw new HttpError(400, 'requestId, priceDHS et vehicleType sont requis.');
  }

  const transporter = await User.findById(req.user!.sub);
  if (!transporter) throw new HttpError(404, 'Utilisateur introuvable.');

  const bid = await Bid.create({
    requestId,
    transporterId: transporter.id,
    transporterName: transporter.companyName || transporter.name,
    priceDHS,
    vehicleType,
    status: 'pending',
  });

  res.status(201).json(bid.toJSON());
}

export async function accept(req: Request, res: Response): Promise<void> {
  const session = await mongoose.startSession();
  try {
    let result: any;
    await session.withTransaction(async () => {
      const bid = await Bid.findById(req.params.id).session(session);
      if (!bid) throw new HttpError(404, 'Offre introuvable.');

      const request = await TransportRequest.findById(bid.requestId).session(session);
      if (!request) throw new HttpError(404, 'Demande introuvable.');
      if (request.clientId?.toString() !== req.user!.sub) {
        throw new HttpError(403, "Vous ne pouvez accepter que les offres sur vos propres demandes.");
      }
      if (bid.status !== 'pending') {
        throw new HttpError(409, 'Cette offre a déjà été traitée.');
      }

      bid.status = 'accepted';
      await bid.save({ session });

      await Bid.updateMany(
        { requestId: bid.requestId, _id: { $ne: bid._id } },
        { status: 'rejected' },
        { session }
      );

      request.status = 'accepted';
      request.transporterId = bid.transporterId as any;
      request.priceDHS = bid.priceDHS;
      await request.save({ session });

      result = { bid: bid.toJSON(), request: request.toJSON() };
    });
    res.json(result);
  } finally {
    await session.endSession();
  }
}
