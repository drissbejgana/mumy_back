import { Schema, model, Types } from 'mongoose';
import { applyToJSON } from '../utils/applyToJSON';

const supportMessageSchema = new Schema(
  {
    // Plain string, not a User ref: system/AI messages use sentinel senders ("gemini", "system").
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['transporter', 'client', 'admin', 'agent', 'system'], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);
applyToJSON(supportMessageSchema);

const supportSessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['transporter', 'client'], required: true },
    messages: [supportMessageSchema],
    needsHuman: { type: Boolean, default: false },
    status: { type: String, enum: ['ai', 'pending_human', 'chatting_human', 'resolved'], default: 'ai' },
  },
  { timestamps: true }
);

applyToJSON(supportSessionSchema);

export const SupportSession = model('SupportSession', supportSessionSchema);
