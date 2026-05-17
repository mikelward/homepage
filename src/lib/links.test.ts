import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LINKS,
  STORAGE_KEY,
  isLinkEntry,
  parseLinks,
  validateLinkForm,
} from './links';

describe('links', () => {
  it('exports a stable storage key', () => {
    expect(STORAGE_KEY).toBe('homepage:links');
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

  describe('validateLinkForm', () => {
    it('rejects an empty URL', () => {
      expect(validateLinkForm({ name: 'A', url: '' })).toEqual({
        ok: false,
        error: 'URL is required.',
      });
    });

    it('rejects a URL that is not a valid http(s) URL', () => {
      expect(validateLinkForm({ name: 'A', url: 'not-a-url' })).toEqual({
        ok: false,
        error: 'Enter a full URL, including https://',
      });
    });

    it('defaults the name to the hostname when blank', () => {
      expect(
        validateLinkForm({ name: '', url: 'https://example.com/path' }),
      ).toEqual({
        ok: true,
        values: { name: 'example.com', url: 'https://example.com/path' },
      });
    });

    it('trims the name and the URL', () => {
      expect(
        validateLinkForm({ name: '  A  ', url: '  https://a.test  ' }),
      ).toEqual({
        ok: true,
        values: { name: 'A', url: 'https://a.test' },
      });
    });
  });
});
