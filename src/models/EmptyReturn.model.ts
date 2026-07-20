import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const emptyReturnSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    transporterName: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    dateTime: { type: Date, required: true },
    basePriceDHS: { type: Number, required: true },
    vehicleType: { type: String, required: true },
    status: { type: String, enum: ['available', 'booked'], default: 'available' },
  },
  { timestamps: true }
);

applyToJSON(emptyReturnSchema);

export const EmptyReturn = model('EmptyReturn', emptyReturnSchema);
