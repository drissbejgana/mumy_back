import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const driverSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    linkedUserId: { type: Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    avatarUrl: String,
    rating: { type: Number, default: 5 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    email: String,
    licenseNumber: String,
    licenseCategory: String,
    licenseExpiry: Date,
    cnssNumber: String,
    hireDate: Date,
    salary: Number,
    notes: String,
    medicalCheckExpiry: Date,
    licenseCategories: [String],
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
  },
  { timestamps: true }
);

applyToJSON(driverSchema);

export const Driver = model('Driver', driverSchema);
