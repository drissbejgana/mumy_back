import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const maintenanceLogSchema = new Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, enum: ['oil_change', 'tires', 'brakes', 'engine', 'other'], required: true },
    cost: { type: Number, required: true },
    description: String,
    provider: String,
  },
  { _id: true }
);
applyToJSON(maintenanceLogSchema);

const fuelLogSchema = new Schema(
  {
    date: { type: Date, required: true },
    liters: { type: Number, required: true },
    cost: { type: Number, required: true },
    mileage: { type: Number, required: true },
  },
  { _id: true }
);
applyToJSON(fuelLogSchema);

const vehicleSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    plate: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['available', 'maintenance', 'on_duty'], default: 'available' },
    year: Number,
    insuranceExpiry: Date,
    technicalControlExpiry: Date,
    fuelType: { type: String, enum: ['Gazole', 'Essence', 'Hybride', 'Électrique'] },
    mileage: Number,
    avgConsumption: Number,
    notes: String,
    maintenanceLogs: [maintenanceLogSchema],
    fuelLogs: [fuelLogSchema],
  },
  { timestamps: true }
);

vehicleSchema.index({ transporterId: 1, plate: 1 }, { unique: true });

applyToJSON(vehicleSchema);

export const Vehicle = model('Vehicle', vehicleSchema);
