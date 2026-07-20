import type { Request, Response } from 'express';
import { TransportRequest } from '../models/TransportRequest.model.js';
import { Driver } from '../models/Driver.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { AdBanner } from '../models/AdBanner.model.js';
import { HttpError } from '../utils/HttpError.js';

// Public, unauthenticated, redacted view for the ?track=<id> page — no client contact
// info, pricing, or notes are exposed, only what a waiting passenger needs to see.
export async function getTracking(req: Request, res: Response): Promise<void> {
  const request = await TransportRequest.findById(req.params.requestId);
  if (!request) throw new HttpError(404, 'Mission introuvable.');

  const [driver, vehicle, banners] = await Promise.all([
    request.assignedDriverId ? Driver.findById(request.assignedDriverId) : null,
    request.assignedVehicleId ? Vehicle.findById(request.assignedVehicleId) : null,
    AdBanner.find({ isActive: true, targetRole: { $in: ['public', 'all'] } }),
  ]);

  res.json({
    request: {
      id: request.id,
      origin: request.origin,
      destination: request.destination,
      status: request.status,
      dateTime: request.dateTime,
      serviceType: request.serviceType,
      podSignature: request.podSignature,
      passengerName: request.passengerName,
      paxCount: request.paxCount,
      daysCount: request.daysCount,
    },
    driver: driver
      ? { id: driver.id, name: driver.name, phone: driver.phone, avatarUrl: driver.avatarUrl, rating: driver.rating }
      : null,
    vehicle: vehicle
      ? { id: vehicle.id, brand: vehicle.brand, model: vehicle.model, plate: vehicle.plate, fuelType: vehicle.fuelType }
      : null,
    banners: banners.map((b) => b.toJSON()),
  });
}
