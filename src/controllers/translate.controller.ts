import type { Request, Response } from 'express';
import { getGeminiClient, GEMINI_MODEL, logGeminiError } from '../services/geminiClient';
import { getCachedTranslation, setCachedTranslation } from '../services/translationCache';
import { HttpError } from '../utils/HttpError';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
};

export async function translate(req: Request, res: Response): Promise<void> {
  const { text, targetLanguage } = req.body ?? {};
  if (!text || !targetLanguage) {
    throw new HttpError(400, 'Missing text or targetLanguage');
  }

  const lang = String(targetLanguage).toLowerCase();
  if (!LANGUAGE_NAMES[lang]) {
    res.json({ translated: text });
    return;
  }

  const cached = getCachedTranslation(lang, text);
  if (cached) {
    res.json({ translated: cached });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.json({ translated: text });
    return;
  }

  try {
    const prompt = `Translate the following short French business/logistic text into natural, professional ${LANGUAGE_NAMES[lang]}.
Keep all numbers, variables (like MAD, DHS, etc.), punctuation, and exact casing intact.
Return ONLY the final translated text. Do not write any markdown code blocks, explanation, or additional commentary.

French text to translate: "${text}"`;

    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });

    let translated = response.text ? response.text.trim() : text;
    if (translated.startsWith('"') && translated.endsWith('"')) {
      translated = translated.substring(1, translated.length - 1);
    }
    if (translated.startsWith('«') && translated.endsWith('»')) {
      translated = translated.substring(1, translated.length - 1);
    }

    setCachedTranslation(lang, text, translated);
    res.json({ translated });
  } catch (err) {
    logGeminiError(`Translate API (${lang})`, err);
    res.json({ translated: text });
  }
}
