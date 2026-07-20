import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const attachmentSchema = new Schema(
  {
    name: String,
    url: String,
    type: { type: String, enum: ['manifest', 'invoice'] },
    date: Date,
  },
  { _id: false }
);

const transportRequestSchema = new Schema(
  {
    // Optional: excursion-booking leads created from a public microsite have no Mumy client account.
    clientId: { type: Types.ObjectId, ref: 'User', default: null, index: true },
    clientName: { type: String, required: true },
    passengerName: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    dateTime: { type: Date, required: true },
    paxCount: { type: Number, required: true },
    serviceType: { type: String, enum: ['simple', 'round_trip', 'disposal', 'multistop'], required: true },
    daysCount: Number,
    isHalfDay: Boolean,
    waypoints: [String],
    welcomeSign: String,
    b2bPaymentTerms: { type: String, enum: ['on_receipt', '30_days_eom', 'end_of_month'] },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'en_route', 'picked_up', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedDriverId: { type: Types.ObjectId, ref: 'Driver', default: null },
    assignedVehicleId: { type: Types.ObjectId, ref: 'Vehicle', default: null },
    transporterId: { type: Types.ObjectId, ref: 'User', default: null, index: true },
    driverRating: Number,
    driverComment: String,
    transporterRating: Number,
    transporterComment: String,
    ratingCreatedAt: Date,
    ratingIsFlagged: { type: Boolean, default: false },
    ratingFlagReason: String,
    priceDHS: Number,
    notes: String,
    attachments: [attachmentSchema],
    podSignature: String,
  },
  { timestamps: true }
);

applyToJSON(transportRequestSchema);

export const TransportRequest = model('TransportRequest', transportRequestSchema);
