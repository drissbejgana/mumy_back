// In-memory cache of AI translations, keyed by target language then source text,
// to avoid duplicate Gemini calls for strings the UI translates repeatedly.
const cache: Record<string, Record<string, string>> = {
  en: {},
  es: {},
  de: {},
  pt: {},
  it: {},
};

export function getCachedTranslation(lang: string, text: string): string | undefined {
  return cache[lang]?.[text];
}

export function setCachedTranslation(lang: string, text: string, translated: string): void {
  if (!cache[lang]) cache[lang] = {};
  cache[lang][text] = translated;
}
