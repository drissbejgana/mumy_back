import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const clientSupplierSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['client', 'supplier'], required: true },
    ice: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
  },
  { timestamps: true }
);

applyToJSON(clientSupplierSchema);

export const ClientSupplier = model('ClientSupplier', clientSupplierSchema);
