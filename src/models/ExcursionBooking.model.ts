import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const excursionBookingSchema = new Schema(
  {
    excursionId: { type: Types.ObjectId, ref: 'Excursion', required: true, index: true },
    excursionTitle: { type: String, required: true },
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    transporterName: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: String,
    clientPhone: String,
    date: { type: Date, required: true },
    paxCount: { type: Number, required: true },
    totalPriceDHS: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

applyToJSON(excursionBookingSchema);

export const ExcursionBooking = model('ExcursionBooking', excursionBookingSchema);
