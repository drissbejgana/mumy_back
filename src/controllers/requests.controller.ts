import type { Request, Response } from 'express';
import { TransportRequest } from '../models/TransportRequest.model';
import { Vehicle } from '../models/Vehicle.model';
import { Driver } from '../models/Driver.model';
import { FinancialRecord } from '../models/FinancialRecord.model';
import { Bid } from '../models/Bid.model';
import { User } from '../models/User.model';
import { ensureOwnership } from '../middleware/requireOwnership';
import { HttpError } from '../utils/HttpError';

async function scopeFilter(req: Request): Promise<Record<string, unknown>> {
  const role = req.user!.role;
  if (role === 'admin') return {};
  if (role === 'client') return { clientId: req.user!.sub };
  if (role === 'transporter') return { $or: [{ status: 'pending' }, { transporterId: req.user!.sub }] };
  // driver
  const driver = await Driver.findOne({ linkedUserId: req.user!.sub });
  return { assignedDriverId: driver?.id ?? '__none__' };
}

export async function list(req: Request, res: Response): Promise<void> {
  const filter = await scopeFilter(req);
  const requests = await TransportRequest.find(filter).sort({ createdAt: -1 });
  res.json(requests.map((r) => r.toJSON()));
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const request = await TransportRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Demande introuvable.');
  res.json(request.toJSON());
}

export async function create(req: Request, res: Response): Promise<void> {
  const client = await User.findById(req.user!.sub);
  if (!client) throw new HttpError(404, 'Utilisateur introuvable.');
  const request = await TransportRequest.create({
    ...req.body,
    clientId: client.id,
    clientName: client.companyName || client.name,
    status: 'pending',
  });
  res.status(201).json(request.toJSON());
}

export async function assignDriver(req: Request, res: Response): Promise<void> {
  const { driverId } = req.body ?? {};
  if (!driverId) throw new HttpError(400, 'driverId requis.');

  const request = await TransportRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Demande introuvable.');
  ensureOwnership(req, request.transporterId ?? req.user!.sub);

  const driver = await Driver.findById(driverId);
  if (!driver) throw new HttpError(404, 'Chauffeur introuvable.');

  const vehicle = await Vehicle.findOne({ transporterId: driver.transporterId, status: 'available' });

  request.assignedDriverId = driver._id as any;
  request.assignedVehicleId = (vehicle?._id as any) ?? request.assignedVehicleId;
  request.transporterId = driver.transporterId as any;
  request.status = 'accepted';
  await request.save();

  res.json(request.toJSON());
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body ?? {};
  if (!status) throw new HttpError(400, 'status requis.');

  const request = await TransportRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Demande introuvable.');

  if (req.user!.role === 'transporter') {
    ensureOwnership(req, request.transporterId);
  } else if (req.user!.role === 'driver') {
    const driver = await Driver.findOne({ linkedUserId: req.user!.sub });
    if (!driver || request.assignedDriverId?.toString() !== driver.id) {
      throw new HttpError(403, "Cette mission ne vous est pas assignée.");
    }
  } else if (req.user!.role !== 'admin') {
    throw new HttpError(403, "Vous n'avez pas les droits pour cette action.");
  }

  const previousStatus = request.status;
  request.status = status;
  await request.save();

  if (status === 'completed' && previousStatus !== 'completed' && request.transporterId) {
    const acceptedBid = await Bid.findOne({ requestId: request.id, status: 'accepted' });
    const amount = acceptedBid?.priceDHS ?? request.priceDHS ?? 1500;
    await FinancialRecord.create({
      transporterId: request.transporterId,
      date: new Date(),
      type: 'revenue',
      amount,
      label: `Course ${request.origin} → ${request.destination}`,
      category: 'Services',
    });
  }

  res.json(request.toJSON());
}

export async function rate(req: Request, res: Response): Promise<void> {
  const { driverRating, driverComment, transporterRating, transporterComment } = req.body ?? {};
  const request = await TransportRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Demande introuvable.');
  if (request.clientId?.toString() !== req.user!.sub) {
    throw new HttpError(403, "Vous ne pouvez noter que vos propres demandes.");
  }

  request.driverRating = driverRating;
  request.driverComment = driverComment;
  request.transporterRating = transporterRating;
  request.transporterComment = transporterComment;
  request.ratingCreatedAt = new Date();
  request.ratingIsFlagged = false;
  request.ratingFlagReason = undefined;
  await request.save();

  res.json(request.toJSON());
}

export async function flagReview(req: Request, res: Response): Promise<void> {
  const { reason } = req.body ?? {};
  const request = await TransportRequest.findByIdAndUpdate(
    req.params.id,
    { ratingIsFlagged: true, ratingFlagReason: reason },
    { new: true }
  );
  if (!request) throw new HttpError(404, 'Demande introuvable.');
  res.json(request.toJSON());
}
