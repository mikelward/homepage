import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_LINKS, STORAGE_KEY } from '../lib/links';
import { _resetLinksCacheForTests, useLinks } from './useLinks';

beforeEach(() => {
  localStorage.clear();
  _resetLinksCacheForTests();
});

afterEach(() => {
  localStorage.clear();
  _resetLinksCacheForTests();
});

describe('useLinks', () => {
  it('seeds with DEFAULT_LINKS on first read', () => {
    const { result } = renderHook(() => useLinks());
    expect(result.current.links).toEqual(DEFAULT_LINKS);
  });

  it('recovers from corrupt JSON by falling back to defaults', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const { result } = renderHook(() => useLinks());
    expect(result.current.links).toEqual(DEFAULT_LINKS);
  });

  it('adds a new link and persists it', () => {
    const { result } = renderHook(() => useLinks());
    act(() => {
      result.current.addLink('Codex', 'https://chatgpt.com/codex/cloud');
    });
    expect(result.current.links).toHaveLength(DEFAULT_LINKS.length + 1);
    const last = result.current.links.at(-1)!;
    expect(last.name).toBe('Codex');
    expect(last.url).toBe('https://chatgpt.com/codex/cloud');
    expect(last.id).toBeTruthy();
    // Survives a fresh read.
    _resetLinksCacheForTests();
    const { result: r2 } = renderHook(() => useLinks());
    expect(r2.current.links).toHaveLength(DEFAULT_LINKS.length + 1);
  });

  it('updates an existing link', () => {
    const { result } = renderHook(() => useLinks());
    const id = result.current.links[0].id;
    act(() => {
      result.current.updateLink(id, { name: 'Renamed' });
    });
    expect(result.current.links[0].name).toBe('Renamed');
    expect(result.current.links[0].url).toBe(DEFAULT_LINKS[0].url);
  });

  it('removes a link by id', () => {
    const { result } = renderHook(() => useLinks());
    const id = result.current.links[0].id;
    act(() => {
      result.current.removeLink(id);
    });
    expect(result.current.links).toEqual([]);
  });

  it('resets to defaults', () => {
    const { result } = renderHook(() => useLinks());
    act(() => {
      result.current.addLink('Extra', 'https://example.com');
      result.current.resetToDefaults();
    });
    expect(result.current.links).toEqual(DEFAULT_LINKS);
  });
});
