import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';

// Built once per warm serverless instance, reused across invocations.
const app = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await connectDB();
  app(req as any, res as any);
}
