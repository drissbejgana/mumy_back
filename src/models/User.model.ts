import { Schema, model } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const riskErrorSchema = new Schema(
  {
    type: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { _id: true }
);
applyToJSON(riskErrorSchema);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // Optional: accounts created via "Sign in with Google" have no password until the
    // user sets one (not yet offered), so they authenticate via googleId only.
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, index: true },
    role: { type: String, enum: ['admin', 'transporter', 'client', 'driver'], required: true },
    status: { type: String, enum: ['pending', 'verified', 'suspended'], default: 'pending' },
    companyName: String,
    phone: String,
    avatarUrl: String,
    kycDocUrl: String,
    kycUploadedAt: Date,
    isFeatured: { type: Boolean, default: false },
    ice: String,
    patente: String,
    rc: String,
    ifFiscal: String,
    cnss: String,
    kycLicenceUrl: String,
    kycLicenceStatus: { type: String, enum: ['missing', 'pending', 'verified', 'rejected'] },
    kycRcUrl: String,
    kycRcStatus: { type: String, enum: ['missing', 'pending', 'verified', 'rejected'] },
    kycInsuranceUrl: String,
    kycInsuranceStatus: { type: String, enum: ['missing', 'pending', 'verified', 'rejected'] },
    kycPatenteUrl: String,
    kycPatenteStatus: { type: String, enum: ['missing', 'pending', 'verified', 'rejected'] },
    kycRejectReason: String,
    errorCount: { type: Number, default: 0 },
    riskErrors: [riskErrorSchema],
    lastLoginAt: Date,
  },
  { timestamps: true }
);

applyToJSON(userSchema);

export const User = model('User', userSchema);
