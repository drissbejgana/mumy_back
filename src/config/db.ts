import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise: Promise<typeof mongoose> | null = null;

// Safe to call on every request: no-ops if already connected, and reuses an in-flight
// connection attempt instead of racing multiple mongoose.connect() calls. This matters on
// Vercel/serverless where a warm function instance reuses this module across invocations.
export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    mongoose.connection.on('connected', () => console.log('[MongoDB] connected'));
    mongoose.connection.on('error', (err) => console.error('[MongoDB] connection error:', err.message));
    connectionPromise = mongoose.connect(env.mongodbUri);
  }

  await connectionPromise;
}
