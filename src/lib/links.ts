import { safeHostname } from './favicon';

export type LinkEntry = {
  id: string;
  name: string;
  url: string;
};

export const STORAGE_KEY = 'homepage:links';

export const DEFAULT_LINKS: LinkEntry[] = [
  { id: 'newshacker', name: 'newshacker', url: 'https://newshacker.app' },
];

export function isLinkEntry(value: unknown): value is LinkEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.url === 'string'
  );
}

export function parseLinks(raw: string | null): LinkEntry[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const valid = parsed.filter(isLinkEntry);
    return valid.length === parsed.length ? valid : null;
  } catch {
    return null;
  }
}

export type LinkFormResult =
  | { ok: true; values: { name: string; url: string } }
  | { ok: false; error: string };

export function validateLinkForm(input: {
  name: string;
  url: string;
}): LinkFormResult {
  const trimmedUrl = input.url.trim();
  if (!trimmedUrl) return { ok: false, error: 'URL is required.' };
  const host = safeHostname(trimmedUrl);
  if (!host) {
    return { ok: false, error: 'Enter a full URL, including https://' };
  }
  const finalName = input.name.trim() || host;
  return { ok: true, values: { name: finalName, url: trimmedUrl } };
}

