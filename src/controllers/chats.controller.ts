import type { Request, Response } from 'express';
import { ChatMessage } from '../models/ChatMessage.model.js';
import { User } from '../models/User.model.js';
import { HttpError } from '../utils/HttpError.js';

// Direct threads between two transporters are named `dm:<idA>:<idB>` with the two user ids
// sorted, so both participants derive the same id without a lookup. Since any transporter
// could otherwise guess another pair's thread id, membership is enforced here.
function assertThreadAccess(req: Request, threadId: string): void {
  if (!threadId.startsWith('dm:')) return;
  if (req.user!.role === 'admin') return;

  const participants = threadId.slice('dm:'.length).split(':');
  if (!participants.includes(req.user!.sub)) {
    throw new HttpError(403, "Cette conversation privée ne vous concerne pas.");
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  const threadId = (req.query.threadId as string) || 'public';
  assertThreadAccess(req, threadId);
  const messages = await ChatMessage.find({ threadId }).sort({ createdAt: 1 });
  res.json(messages.map((m) => m.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { message, threadId } = req.body ?? {};
  if (!message) throw new HttpError(400, 'message requis.');
  assertThreadAccess(req, threadId || 'public');

  const sender = await User.findById(req.user!.sub);
  if (!sender) throw new HttpError(404, 'Utilisateur introuvable.');

  const chatMessage = await ChatMessage.create({
    threadId: threadId || 'public',
    senderId: sender.id,
    senderName: sender.companyName || sender.name,
    senderRole: sender.role,
    message,
  });

  res.status(201).json(chatMessage.toJSON());
}
