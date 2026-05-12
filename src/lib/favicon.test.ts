import { describe, expect, it } from 'vitest';
import { buildFaviconCandidates, safeHostname } from './favicon';

describe('safeHostname', () => {
  it('returns the hostname for a valid URL', () => {
    expect(safeHostname('https://newshacker.app/foo?bar=1')).toBe(
      'newshacker.app',
    );
  });

  it('returns null for an invalid URL', () => {
    expect(safeHostname('not a url')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(safeHostname('')).toBeNull();
  });
});

describe('buildFaviconCandidates', () => {
  it('returns three ordered candidates with the site host first', () => {
    expect(buildFaviconCandidates('https://newshacker.app')).toEqual([
      'https://newshacker.app/apple-touch-icon.png',
      'https://newshacker.app/apple-touch-icon-precomposed.png',
      'https://www.google.com/s2/favicons?domain=newshacker.app&sz=128',
    ]);
  });

  it('encodes the domain in the S2 URL', () => {
    const [, , s2] = buildFaviconCandidates('https://例え.test');
    expect(s2).toContain('domain=');
    // The hostname round-trips through URL → Punycode, so we just assert
    // it's URL-encoded (no raw spaces or unicode characters in the param).
    expect(s2).not.toMatch(/\s/);
  });

  it('returns an empty list for malformed URLs', () => {
    expect(buildFaviconCandidates('not a url')).toEqual([]);
  });
});
