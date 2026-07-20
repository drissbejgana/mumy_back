import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const excursionSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    transporterName: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    duration: String,
    priceDHS: { type: Number, required: true },
    imageUrl: String,
    location: String,
    maxPax: Number,
    highlights: [String],
    includes: [String],
    excludes: [String],
    isActive: { type: Boolean, default: true },
    youtubeUrl: String,
    cancellationPolicy: String,
    departureTime: String,
    meetingPoint: String,
    languages: [String],
  },
  { timestamps: true }
);

applyToJSON(excursionSchema);

export const Excursion = model('Excursion', excursionSchema);
