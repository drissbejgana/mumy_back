import type { Request, Response } from 'express';
import { SupportSession } from '../models/SupportSession.model.js';
import { User } from '../models/User.model.js';
import { getGeminiClient, GEMINI_MODEL, logGeminiError } from '../services/geminiClient.js';
import { sanitizeString } from '../utils/sanitize.js';
import { HttpError } from '../utils/HttpError.js';

// Resolves which session a request targets: admins (support agents) may reply into
// any user's session via ?userId=/body.userId; everyone else only ever touches their own.
function resolveTargetUserId(req: Request): string {
  if (req.user!.role === 'admin') {
    const target = (req.body?.userId as string) || (req.query.userId as string);
    if (!target) throw new HttpError(400, 'userId requis pour un agent support.');
    return target;
  }
  return req.user!.sub;
}

export async function listSessions(_req: Request, res: Response): Promise<void> {
  const sessions = await SupportSession.find().sort({ updatedAt: -1 });
  res.json(sessions.map((s) => s.toJSON()));
}

export async function getOrInitSession(req: Request, res: Response): Promise<void> {
  const userId = resolveTargetUserId(req);
  let session = await SupportSession.findOne({ userId });

  if (!session) {
    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, 'Utilisateur introuvable.');
    if (user.role !== 'transporter' && user.role !== 'client') {
      throw new HttpError(400, 'Le support est réservé aux transporteurs et clients.');
    }

    session = await SupportSession.create({
      userId: user.id,
      userName: user.companyName || user.name,
      userRole: user.role,
      needsHuman: false,
      status: 'ai',
      messages: [
        {
          senderId: 'gemini',
          senderName: 'Assistant IA',
          senderRole: 'agent',
          message: `Bonjour ${user.companyName || user.name} ! Comment puis-je vous aider aujourd'hui ? Je suis l'assistant virtuel Mumy. Si vous préférez parler à un conseiller, cliquez sur "Parler à un conseiller" à tout moment.`,
        },
      ],
    });
  }

  res.json(session.toJSON());
}

function keywordFallbackReply(userName: string, message: string): { reply: string; escalate: boolean } {
  const lowerMsg = message.toLowerCase();
  let aiReply = `Bonjour ${userName}. En tant qu'assistant de support Mumy, j'ai bien reçu votre message : "${message}". `;
  let escalate = false;

  if (lowerMsg.includes('retard') || lowerMsg.includes('incident') || lowerMsg.includes('contester') || lowerMsg.includes('justifier')) {
    aiReply +=
      "Concernant les incidents de retard sur Mumy, vous pouvez justifier le contretemps (par exemple un retard de vol de vos clients) directement en transmettant un justificatif. Souhaitez-vous que je signale ce dossier pour qu'un conseiller humain de notre équipe support valide l'annulation de la pénalité ?";
  } else if (lowerMsg.includes('algorithme') || lowerMsg.includes('fiabilité') || lowerMsg.includes('confiance') || lowerMsg.includes('vms')) {
    aiReply +=
      "L'indice de confiance de l'algorithme Mumy évalue la ponctualité de vos chauffeurs et la conformité de vos véhicules. Une liaison VMS bien renseignée permet d'optimiser l'attribution des courses et d'améliorer votre visibilité auprès des Riads. Souhaitez-vous parler à un conseiller pour auditer votre score ?";
  } else if (lowerMsg.includes('retour') || lowerMsg.includes('vide') || lowerMsg.includes('réduction') || lowerMsg.includes('tarification')) {
    aiReply +=
      "Sur Mumy, publier un trajet de retour à vide permet d'obtenir automatiquement une réduction de 50% pour attirer les réservations des Riads partenaires, tout en optimisant votre taux de remplissage. C'est une exclusivité du yield management de Mumy. Voulez-vous qu'un conseiller vous explique comment maximiser ces ventes ?";
  } else if (lowerMsg.includes('sécurité') || lowerMsg.includes('véhicule') || lowerMsg.includes('chauffeur') || lowerMsg.includes('conformité')) {
    aiReply +=
      'Mumy impose une charte stricte de sécurité : tous les véhicules doivent être agréés pour le transport touristique au Maroc, et les chauffeurs doivent détenir une carte professionnelle valide. Nous effectuons des audits réguliers pour garantir un service 5 étoiles.';
  } else if (lowerMsg.includes('conseiller') || lowerMsg.includes('humain') || lowerMsg.includes('agent') || lowerMsg.includes('support') || lowerMsg.includes('parler')) {
    aiReply +=
      'Très bien, je comprends tout à fait. Je viens d\'enregistrer votre demande d\'assistance humaine. Un de nos conseillers support Mumy va examiner votre dossier et vous répondre directement dans ce chat d\'ici quelques instants.';
    escalate = true;
  } else {
    const isOffTopic = ![
      'mumy', 'transport', 'maroc', 'course', 'trajet', 'flotte', 'riad', 'hôtel', 'chauffeur', 'véhicule', 'planning', 'vms', 'tarif', 'réservation', 'portail', 'client',
    ].some((kw) => lowerMsg.includes(kw));

    if (isOffTopic) {
      aiReply = `Désolé ${userName}, je suis l'assistant virtuel Mumy et je ne peux répondre qu'aux questions concernant Mumy App, les transports touristiques au Maroc et la gestion de vos rotations. Comment puis-je vous aider sur vos courses ou votre planning aujourd'hui ?`;
    } else {
      aiReply +=
        'Je suis à votre entière disposition pour vous guider sur Mumy App (tarifs, plannings, attribution, retours à vide ou litiges). Souhaitez-vous que je vous mette en relation directe avec un conseiller humain de notre équipe ?';
    }
  }

  return { reply: aiReply, escalate };
}

export async function postMessage(req: Request, res: Response): Promise<void> {
  const { message, requestHuman, resolveSession } = req.body ?? {};
  const userId = resolveTargetUserId(req);

  const session = await SupportSession.findOne({ userId });
  if (!session) throw new HttpError(404, 'Session de support introuvable.');

  if (requestHuman) {
    session.needsHuman = true;
    session.status = 'pending_human';
    session.messages.push({
      senderId: 'system',
      senderName: 'Système',
      senderRole: 'system',
      message: '⚠️ Demande de transfert vers un conseiller humain enregistrée. Un agent de support va vous répondre sous peu.',
    } as any);
    await session.save();
    res.json(session.toJSON());
    return;
  }

  if (resolveSession) {
    session.needsHuman = false;
    session.status = 'resolved';
    session.messages.push({
      senderId: 'system',
      senderName: 'Système',
      senderRole: 'system',
      message: '✓ Cette session de support a été marquée comme résolue.',
    } as any);
    await session.save();
    res.json(session.toJSON());
    return;
  }

  if (!message) throw new HttpError(400, 'Le message ne peut pas être vide.');

  const senderRole = req.user!.role === 'admin' ? 'agent' : req.user!.role;
  const senderUser = await User.findById(req.user!.sub);

  session.messages.push({
    senderId: req.user!.sub,
    senderName: senderUser?.companyName || senderUser?.name || session.userName,
    senderRole: senderRole as any,
    message: sanitizeString(message, 1000),
  } as any);

  if (session.status === 'ai' && senderRole !== 'agent') {
    const ai = getGeminiClient();
    const systemInstruction = `
      Tu es l'assistant de support de la plateforme Mumy App (Maroc, B2B logistique de transport de luxe touristique).
      Tu communiques avec un ${session.userRole === 'transporter' ? 'Transporteur' : 'Client Pro (Riad, Hôtel)'} nommé ${session.userName}.

      RÈGLE ABSOLUE : Tu ne dois répondre QU'AUX questions directement liées à Mumy App, au transport touristique au Maroc, à la gestion de flotte, aux chauffeurs, aux véhicules, aux trajets de retours à vide ou au fonctionnement général de Mumy.
      Si l'utilisateur pose une question hors-sujet ou non liée à Mumy, tu dois refuser poliment et fermement d'y répondre, en expliquant que ton rôle est exclusivement dédié à l'assistance technique et commerciale de Mumy App et en réorientant la discussion vers les services de transport.

      Style et Règles :
      - Professionnel, très concis (moins de 80 mots), chaleureux, amical et poli (style conciergerie de luxe).
      - Réponds TOUJOURS en français.
      - Si l'interlocuteur souhaite parler à un conseiller humain ou si tu ne peux pas l'aider, indique simplement que tu transfères le dossier à un conseiller de l'équipe support Mumy et qu'il prendra le relais.
    `;

    if (!ai) {
      const { reply, escalate } = keywordFallbackReply(session.userName, message);
      if (escalate) {
        session.status = 'pending_human';
        session.needsHuman = true;
      }
      session.messages.push({ senderId: 'gemini', senderName: 'Assistant IA', senderRole: 'agent', message: reply } as any);
    } else {
      try {
        const historyPrompt = `
          ${systemInstruction}

          Historique de la conversation de support :
          ${session.messages.map((m) => `${m.senderName} (${m.senderRole === 'agent' ? 'Support' : 'Utilisateur'}): ${m.message}`).join('\n')}

          Donne la prochaine réponse du support intelligent Mumy. Sois direct, amical, axé B2B et très concis (moins de 80 mots).
        `;
        const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: historyPrompt });
        session.messages.push({ senderId: 'gemini', senderName: 'Assistant IA', senderRole: 'agent', message: (response.text ?? '').trim() } as any);
      } catch (err) {
        logGeminiError('Support Chat', err);
        const { reply, escalate } = keywordFallbackReply(session.userName, message);
        if (escalate) {
          session.status = 'pending_human';
          session.needsHuman = true;
        }
        session.messages.push({ senderId: 'gemini', senderName: 'Assistant IA (Simulation)', senderRole: 'agent', message: reply } as any);
      }
    }
  }

  await session.save();
  res.json(session.toJSON());
}
