import type { Request, Response } from 'express';
import { getGeminiClient, GEMINI_MODEL, logGeminiError } from '../services/geminiClient';
import { sanitizeString } from '../utils/sanitize';
import { HttpError } from '../utils/HttpError';

function clampCount(value: unknown): number {
  return Math.min(Math.max(0, Number(value || 0)), 10000);
}

function assistantFallbackReply(lastUserMessage: string): string {
  let reply = 'Je suis ravi de vous aider sur Mumy App ! ';
  const msgLower = lastUserMessage.toLowerCase();
  if (msgLower.includes('litige') || msgLower.includes('retard') || msgLower.includes('#304')) {
    reply +=
      "Concernant le litige détecté sur le chat #304 (vol en retard), je suggère de réassigner le chauffeur Ahmed El Mansouri pour absorber le décalage, ou d'envoyer une notification automatique au Riad Royal pour confirmer que le chauffeur l'attendra sans frais supplémentaires.";
  } else if (msgLower.includes('retour') || msgLower.includes('vide')) {
    reply +=
      "Pour optimiser vos retours à vide, l'algorithme Mumy applique -50% sur le tarif de base, plus 20% de commission. Cela permet d'offrir une réduction nette de 30% aux Riads tout en vous assurant un revenu additionnel sur l'axe Essaouira - Marrakech.";
  } else {
    reply +=
      "En tant qu'assistant de Mumy, je supervise la marketplace, l'état de la flotte et le yield management. Comment puis-je vous aider à optimiser votre logistique touristique marocaine aujourd'hui ?";
  }
  return reply;
}

export async function assistant(req: Request, res: Response): Promise<void> {
  const { messages, platformState } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpError(400, 'Format des messages invalide ou vide.');
  }

  const sanitizedMessages = messages
    .map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: sanitizeString(m.content, 1000) }))
    .filter((m: any) => m.content !== '');

  if (sanitizedMessages.length === 0) {
    throw new HttpError(400, "Aucun message exploitable n'a été fourni.");
  }

  const lastUserMessage = sanitizedMessages[sanitizedMessages.length - 1].content;

  const safeState = {
    requestsCount: clampCount(platformState?.requestsCount),
    emptyReturnsCount: clampCount(platformState?.emptyReturnsCount),
    vehiclesCount: clampCount(platformState?.vehiclesCount),
    driversCount: clampCount(platformState?.driversCount),
    alertsCount: clampCount(platformState?.alertsCount),
  };

  const ai = getGeminiClient();

  const systemInstruction = `
    Tu es l'Assistant IA Mumy, un expert en gestion de transport touristique B2B au Maroc.
    Tu analyses en temps réel les données de la plateforme Mumy App (Maroc, transactions en Dirhams DHS).
    Données de la plateforme actuelle :
    - Nombre de demandes actives : ${safeState.requestsCount}
    - Nombre de retours à vide publiés : ${safeState.emptyReturnsCount}
    - Flotte de véhicules : ${safeState.vehiclesCount} véhicules, ${safeState.driversCount} chauffeurs actifs.
    - Nombre de litiges détectés : ${safeState.alertsCount} alertes de sentiment.

    Règles de communication :
    - Réponds TOUJOURS en français avec professionnalisme, clarté et concision (style Shopify / B2B premium).
    - Sois force de proposition pour résoudre les litiges de vol en retard, l'attribution des chauffeurs ou la revente des retours à vide.
    - N'invente pas de données techniques internes ou de logs simulés inutiles.
    - Sois amical mais formel.
  `;

  if (!ai) {
    res.json({
      reply: assistantFallbackReply(lastUserMessage),
      isSimulated: true,
      note: "Note: Exécution en mode simulation car GEMINI_API_KEY n'est pas configurée.",
    });
    return;
  }

  try {
    const prompt = `
      ${systemInstruction}

      Historique de conversation :
      ${sanitizedMessages.map((m: any) => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`).join('\n')}

      Utilisateur : ${lastUserMessage}
      Assistant :
    `;

    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
    res.json({ reply: response.text });
  } catch (error: any) {
    logGeminiError('Assistant Chat', error);
    res.json({
      reply: assistantFallbackReply(lastUserMessage),
      isSimulated: true,
      note: `Note: Exécution en mode simulation suite à une limite de quota d'API Gemini (${error.message || 'RESOURCE_EXHAUSTED'}).`,
    });
  }
}

function auditFallbackReport(safeState: { requestsCount: number; emptyReturnsCount: number; alertsCount: number }, quotaExceeded: boolean): string {
  const title = quotaExceeded ? 'RAPPORT D\'OPTIMISATION HEBDOMADAIRE MUMY (SIMULÉ - QUOTA ÉPUISÉ)' : 'RAPPORT D\'OPTIMISATION HEBDOMADAIRE MUMY (SIMULÉ)';
  return `
# 📊 ${title}

## 1. Analyse de performance hebdomadaire
* **Demandes créées** : ${safeState.requestsCount || 2} trajets initiés.
* **Taux d'engagement** : Intérêt solide des transporteurs avec plusieurs offres émises en temps réel.
* **Volume de retours à vide** : ${safeState.emptyReturnsCount || 2} trajets publiés. La conversion actuelle sur ces trajets est de 65%. C'est le pivot de notre rentabilité.

## 2. Recommandations UX pour le Portail Client
* **Rassurance immédiate** : Mettre en avant le badge **🛡️ GARANTIE QUALITÉ MUMY** pour éliminer la friction liée aux retards de chauffeurs.
* **Saisie assistée** : Le formulaire de demande flash est fluide. L'affichage dynamique du "Nombre de jours" pour l'option "Mise à disposition" réduit les erreurs de saisie de 40%.

## 3. Leviers d'optimisation de la conversion
* **Règle Tarifaire** : Maintenir l'algorithme strict : -50% de réduction transporteur, +20% de commission Mumy. Le Riad obtient ainsi une réduction de 30% très incitative par rapport au marché de gré à gré.
* **White-Label** : Le masquage des transporteurs est vital pour éviter le "churn" et la négociation en direct. Continuer d'afficher **[ PRESTATAIRE CERTIFIÉ MUMY ]**.

## 4. Stratégie de confiance et gestion des litiges
* **Litiges détectés** : ${safeState.alertsCount || 1} alerte active sur le vol en retard. Une intervention proactive (proposer d'attendre ou réassigner via le dispatch) fidélise instantanément le Riad.
  `;
}

export async function audit(req: Request, res: Response): Promise<void> {
  const { platformState } = req.body ?? {};

  const safeState = {
    requestsCount: clampCount(platformState?.requestsCount),
    bidsCount: clampCount(platformState?.bidsCount),
    emptyReturnsCount: clampCount(platformState?.emptyReturnsCount),
    alertsCount: clampCount(platformState?.alertsCount),
  };

  const ai = getGeminiClient();

  const prompt = `
    Rédige un rapport d'audit d'optimisation hebdomadaire en Markdown pour la plateforme Mumy App.
    Mumy App est une plateforme de transport touristique B2B reliant des Riads/Hôtels marocains à des sociétés de transport de luxe.
    Données de la semaine :
    - Demandes de trajets : ${safeState.requestsCount}
    - Offres de transporteurs soumises : ${safeState.bidsCount}
    - Retours à vide publiés : ${safeState.emptyReturnsCount}
    - Taux de conversion des retours à vide : 65%
    - Score de satisfaction moyen client : 4.8/5
    - Alertes de litige / sentiment négatif : ${safeState.alertsCount}

    Structure attendue du rapport (en Français, style professionnel, constructif et axé sur l'UX et l'optimisation B2B) :
    1. 📊 Analyse de performance hebdomadaire (Commentaires sur les chiffres clés).
    2. 💡 Recommandations UX pour le Portail Client (Simplifier l'ergonomie, rassurer sur les retards).
    3. 🚀 Leviers d'optimisation de la conversion (Comment vendre 100% des retours à vide, tarification dynamique).
    4. 🛡️ Stratégie de confiance et gestion des litiges (Politique de pénalité de retard, satisfaction client).
  `;

  if (!ai) {
    res.json({
      report: auditFallbackReport(safeState, false),
      isSimulated: true,
      note: 'Note: Rapport simulé. Configurez GEMINI_API_KEY pour des audits réels en continu.',
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
    res.json({ report: response.text });
  } catch (error: any) {
    logGeminiError('Audit Report', error);
    res.json({
      report: auditFallbackReport(safeState, true),
      isSimulated: true,
      note: `Note: Rapport simulé suite à une limite de quota d'API Gemini (${error.message || 'RESOURCE_EXHAUSTED'}).`,
    });
  }
}

export async function yieldAdvice(req: Request, res: Response): Promise<void> {
  const { route, demandLevel } = req.body ?? {};
  const ai = getGeminiClient();

  const safeRoute = sanitizeString(route, 100) || 'Essaouira - Marrakech';
  const safeDemandLevel = sanitizeString(demandLevel, 50) || 'Forte';

  const prompt = `
    Agis en tant qu'algorithme de Yield Management prédictif intelligent pour Mumy App.
    Analyse l'axe de transport suivant au Maroc :
    - Trajet : ${safeRoute}
    - Niveau de demande détecté : ${safeDemandLevel}

    Rédige une recommandation de Yield tarifaire concise d'une seule phrase pour le transporteur (en Français, style alerte business direct, maximum 45 mots).
  `;

  if (!ai) {
    res.json({
      advice: `📈 Alerte Yield Gemini : Forte demande détectée sur l'axe ${safeRoute} ce dimanche. Suggestion : Augmentez votre prix de retour à vide de 15% pour optimiser vos marges tout en restant attractif.`,
      isSimulated: true,
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
    res.json({ advice: (response.text ?? '').trim() });
  } catch (error: any) {
    logGeminiError('Yield Advice', error);
    res.json({ advice: `📈 Alerte Yield : Forte demande sur l'axe ${safeRoute}. Pensez à ajuster vos prix de +15% pour optimiser vos revenus.` });
  }
}
