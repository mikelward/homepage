/**
 * Wrap `crypto.randomUUID()` behind a function so tests can stub it.
 * Falls back to a Math.random ID on the (unlikely) chance the browser
 * doesn't expose `crypto.randomUUID` — happy-dom and every shipping
 * browser since ~2022 does.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
