import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LINKS,
  STORAGE_KEY,
  isLinkEntry,
  parseLinks,
} from './links';

describe('links', () => {
  it('exports a stable storage key', () => {
    expect(STORAGE_KEY).toBe('home:links');
  });

  it('seeds with a single newshacker entry', () => {
    expect(DEFAULT_LINKS).toHaveLength(1);
    expect(DEFAULT_LINKS[0]).toMatchObject({
      name: 'newshacker',
      url: 'https://newshacker.app',
    });
  });

  describe('isLinkEntry', () => {
    it('accepts well-formed entries', () => {
      expect(isLinkEntry({ id: 'a', name: 'A', url: 'https://a.test' })).toBe(
        true,
      );
    });

    it.each([
      null,
      undefined,
      'string',
      42,
      {},
      { id: 1, name: 'A', url: 'https://a.test' },
      { id: 'a', name: 'A' },
    ])('rejects %p', (value) => {
      expect(isLinkEntry(value)).toBe(false);
    });
  });

  describe('parseLinks', () => {
    it('returns null for missing / empty input', () => {
      expect(parseLinks(null)).toBeNull();
      expect(parseLinks('')).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      expect(parseLinks('{not json}')).toBeNull();
    });

    it('returns null when the JSON is not an array', () => {
      expect(parseLinks('{"id":"a","name":"A","url":"x"}')).toBeNull();
    });

    it('returns null if any element is malformed (all-or-nothing)', () => {
      const mixed = JSON.stringify([
        { id: 'a', name: 'A', url: 'https://a.test' },
        { id: 'b' },
      ]);
      expect(parseLinks(mixed)).toBeNull();
    });

    it('parses a well-formed array', () => {
      const links = [
        { id: 'a', name: 'A', url: 'https://a.test' },
        { id: 'b', name: 'B', url: 'https://b.test' },
      ];
      expect(parseLinks(JSON.stringify(links))).toEqual(links);
    });
  });
});
