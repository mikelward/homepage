/**
 * Build an ordered list of icon URLs to try for a given link URL.
 *
 * Order is best-quality first:
 *   1. The site's own `/apple-touch-icon.png` (usually 180x180).
 *   2. The precomposed variant some older sites ship.
 *   3. Google's S2 favicon service at 128px — works for anything with
 *      a public favicon, but is a third-party request.
 *
 * `<img>` is not subject to CORS for display, so all three render without
 * a preflight. The service worker caches them so subsequent loads work
 * offline.
 */
export function buildFaviconCandidates(rawUrl: string): string[] {
  const host = safeHostname(rawUrl);
  if (!host) return [];
  return [
    `https://${host}/apple-touch-icon.png`,
    `https://${host}/apple-touch-icon-precomposed.png`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
  ];
}

export function safeHostname(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname || null;
  } catch {
    return null;
  }
}
