import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const teamMemberSchema = new Schema(
  {
    transporterId: { type: Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    role: { type: String, required: true },
    permissions: [String],
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

applyToJSON(teamMemberSchema);

export const TeamMember = model('TeamMember', teamMemberSchema);
