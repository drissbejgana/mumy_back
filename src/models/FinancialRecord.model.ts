import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const financialRecordSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['revenue', 'expense'], required: true },
    amount: { type: Number, required: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

applyToJSON(financialRecordSchema);

export const FinancialRecord = model('FinancialRecord', financialRecordSchema);
