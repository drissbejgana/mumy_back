// Strips HTML tags and clamps length to prevent XSS / prompt injection / oversized payloads.
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  let sanitized = input.replace(/<[^>]*>/g, '');
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized.trim();
}
