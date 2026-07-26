import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

// One driver/vehicle shift in a transporter's weekly VMS planning grid.
const vmsLiaisonSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Types.ObjectId, ref: 'Driver', required: true },
    vehicleId: { type: Types.ObjectId, ref: 'Vehicle', required: true },
    dayOfWeek: {
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      required: true,
    },
    shift: { type: String, enum: ['morning', 'afternoon', 'night', 'full_day'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    // Kept as a plain YYYY-MM-DD string: the planning grid matches on it verbatim, and a
    // Date would drag timezone offsets into what is a calendar day, not an instant.
    date: { type: String, required: true, index: true },
    notes: String,
  },
  { timestamps: true }
);

applyToJSON(vmsLiaisonSchema);

export const VmsLiaison = model('VmsLiaison', vmsLiaisonSchema);
