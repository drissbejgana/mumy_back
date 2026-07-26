import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON.js';

const documentItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

// A commercial document a transporter issues to a partner: devis, facture, bon de commande
// or facture proforma. Totals are stored as issued, not recomputed on read — a document
// already sent to a client must not change if a rate is edited later.
const businessDocumentSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    // Human-readable reference shown on the document itself, e.g. "FACT-48213".
    reference: { type: String, required: true, index: true },
    docType: { type: String, enum: ['Devis', 'Facture', 'Bon de commande', 'Facture Proforma'], required: true },
    partnerId: { type: Types.ObjectId, ref: 'ClientSupplier', default: null },
    partnerName: { type: String, required: true },
    partnerIce: String,
    partnerPhone: String,
    partnerEmail: String,
    partnerAddress: String,
    passengerName: String,
    items: [documentItemSchema],
    tvaRate: { type: Number, default: 20 },
    subtotal: { type: Number, required: true },
    tvaAmount: { type: Number, required: true },
    totalTtc: { type: Number, required: true },
    notes: String,
    status: { type: String, enum: ['created', 'shared', 'paid', 'cancelled'], default: 'created' },
    sharedWith: { type: String, default: null },
  },
  { timestamps: true }
);

applyToJSON(businessDocumentSchema);

export const BusinessDocument = model('BusinessDocument', businessDocumentSchema);
