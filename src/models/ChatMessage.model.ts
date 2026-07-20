import { Schema, model, Types } from 'mongoose';

const chatMessageSchema = new Schema(
  {
    threadId: { type: String, default: 'public', index: true },
    senderId: { type: Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['transporter', 'client', 'admin', 'driver'], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// Custom (not the shared applyToJSON helper) because this model also exposes a
// French-locale HH:mm `timestamp` string — matching the original app's wire format,
// which the UI displays directly — alongside the standard `id`/`createdAt` fields.
chatMessageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    ret.timestamp = doc.createdAt
      ? new Date(doc.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '';
    return ret;
  },
});

export const ChatMessage = model('ChatMessage', chatMessageSchema);
