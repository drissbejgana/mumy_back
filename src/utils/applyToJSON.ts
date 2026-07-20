import type { Schema } from 'mongoose';

// Makes every model's JSON output match the frontend's expected wire format: `id` instead of
// `_id`, no `__v`, and ObjectId refs stringified automatically by Mongoose's default toJSON behavior.
export function applyToJSON(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
}
