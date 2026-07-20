import { Schema, model } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const adBannerSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    imageUrl: String,
    linkUrl: String,
    targetRole: { type: String, enum: ['all', 'transporter', 'client', 'driver', 'public'], required: true },
    optimizationType: { type: String, enum: ['cpm', 'cpc', 'weekly', 'monthly'], required: true },
    cpcValue: { type: Number, default: 0 },
    cpmValue: { type: Number, default: 0 },
    weeklyRate: Number,
    monthlyRate: Number,
    durationUnits: Number,
    budget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

applyToJSON(adBannerSchema);

export const AdBanner = model('AdBanner', adBannerSchema);
