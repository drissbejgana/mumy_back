import type { Request, Response } from 'express';
import { ChatMessage } from '../models/ChatMessage.model';
import { User } from '../models/User.model';
import { HttpError } from '../utils/HttpError';

export async function list(req: Request, res: Response): Promise<void> {
  const threadId = (req.query.threadId as string) || 'public';
  const messages = await ChatMessage.find({ threadId }).sort({ createdAt: 1 });
  res.json(messages.map((m) => m.toJSON()));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { message, threadId } = req.body ?? {};
  if (!message) throw new HttpError(400, 'message requis.');

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
