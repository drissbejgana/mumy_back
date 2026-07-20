import type { Request, Response } from 'express';
import { Vehicle } from '../models/Vehicle.model.js';
import { ensureOwnership } from '../middleware/requireOwnership.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(req: Request, res: Response): Promise<void> {
  const filter = req.user!.role === 'admin' && req.query.transporterId ? { transporterId: req.query.transporterId } : req.user!.role === 'admin' ? {} : { transporterId: req.user!.sub };
  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
  res.json(vehicles.map((v) => v.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.create({ ...req.body, transporterId: req.user!.sub });
  res.status(201).json(vehicle.toJSON());
}

export async function update(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new HttpError(404, 'Véhicule introuvable.');
  ensureOwnership(req, vehicle.transporterId);
  Object.assign(vehicle, req.body);
  await vehicle.save();
  res.json(vehicle.toJSON());
}

export async function remove(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new HttpError(404, 'Véhicule introuvable.');
  ensureOwnership(req, vehicle.transporterId);
  await vehicle.deleteOne();
  res.status(204).send();
}

export async function addMaintenanceLog(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new HttpError(404, 'Véhicule introuvable.');
  ensureOwnership(req, vehicle.transporterId);
  vehicle.maintenanceLogs?.push(req.body);
  await vehicle.save();
  res.status(201).json(vehicle.toJSON());
}

export async function addFuelLog(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new HttpError(404, 'Véhicule introuvable.');
  ensureOwnership(req, vehicle.transporterId);
  vehicle.fuelLogs?.push(req.body);
  await vehicle.save();
  res.status(201).json(vehicle.toJSON());
}
