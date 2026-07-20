import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const transporterWebsiteSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    transporterName: { type: String, required: true },
    customDomain: String,
    dnsStatus: { type: String, enum: ['not_configured', 'pending', 'active'], default: 'not_configured' },
    aRecord: String,
    cnameRecord: String,
    siteTitle: { type: String, required: true },
    siteSubtitle: String,
    aboutText: String,
    primaryColor: { type: String, default: '#008060' },
    contactEmail: String,
    contactPhone: String,
    headerImageUrl: String,
    logoUrl: String,
    tripadvisorUrl: String,
  },
  { timestamps: true }
);

applyToJSON(transporterWebsiteSchema);

export const TransporterWebsite = model('TransporterWebsite', transporterWebsiteSchema);
