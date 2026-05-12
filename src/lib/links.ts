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
