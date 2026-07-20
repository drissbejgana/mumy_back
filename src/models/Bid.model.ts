import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const bidSchema = new Schema(
  {
    requestId: { type: Types.ObjectId, ref: 'TransportRequest', required: true, index: true },
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    transporterName: { type: String, required: true },
    priceDHS: { type: Number, required: true },
    vehicleType: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

applyToJSON(bidSchema);

export const Bid = model('Bid', bidSchema);
