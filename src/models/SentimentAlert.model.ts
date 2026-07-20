import { Schema, model } from 'mongoose';

const sentimentAlertSchema = new Schema(
  {
    chatId: { type: String, required: true },
    sentiment: { type: String, enum: ['negative', 'neutral', 'positive'], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// Custom (not the shared applyToJSON helper): also exposes `timestamp` as an ISO string
// alias of `createdAt`, matching the original app's wire format that the UI displays.
sentimentAlertSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    ret.timestamp = doc.createdAt ? new Date(doc.createdAt).toISOString() : '';
    return ret;
  },
});

export const SentimentAlert = model('SentimentAlert', sentimentAlertSchema);
