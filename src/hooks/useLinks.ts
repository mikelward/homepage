import { useCallback, useSyncExternalStore } from 'react';
import { newId } from '../lib/id';
import {
  DEFAULT_LINKS,
  STORAGE_KEY,
  parseLinks,
  type LinkEntry,
} from '../lib/links';

type Listener = () => void;
const listeners = new Set<Listener>();

// Cache the parsed snapshot so useSyncExternalStore's snapshot identity is
// stable until something actually writes. Without this, every render call
// reads fresh JSON and React detects a "new" array each time, which
// triggers an infinite update loop in strict mode.
let cached: LinkEntry[] | null = null;

function readStorage(): LinkEntry[] {
  if (cached) return cached;
  if (typeof localStorage === 'undefined') {
    cached = DEFAULT_LINKS;
    return cached;
  }
  const parsed = parseLinks(localStorage.getItem(STORAGE_KEY));
  cached = parsed ?? DEFAULT_LINKS;
  return cached;
}

function writeStorage(next: LinkEntry[]): void {
  cached = next;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  for (const l of listeners) l();
}

function subscribe(l: Listener): () => void {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null;
      l();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

/**
 * Storage primitives exposed for the sync layer. They bypass React and
 * notify the same listeners the hook uses, so a remote write lands in the
 * UI on the next render.
 */
export function readLinksStorage(): LinkEntry[] {
  return readStorage();
}

export function writeLinksStorage(next: LinkEntry[]): void {
  writeStorage(next);
}

export function subscribeLinksStorage(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/**
 * Reset the in-module cache. Tests call this between cases so each one
 * sees a fresh read from localStorage; production code never needs it.
 */
export function _resetLinksCacheForTests(): void {
  cached = null;
}

export function useLinks() {
  const links = useSyncExternalStore(subscribe, readStorage, readStorage);

  const addLink = useCallback((name: string, url: string): LinkEntry => {
    const entry: LinkEntry = { id: newId(), name, url };
    writeStorage([...readStorage(), entry]);
    return entry;
  }, []);

  const updateLink = useCallback(
    (id: string, patch: Partial<Omit<LinkEntry, 'id'>>) => {
      writeStorage(
        readStorage().map((l) => (l.id === id ? { ...l, ...patch } : l)),
      );
    },
    [],
  );

  const removeLink = useCallback((id: string) => {
    writeStorage(readStorage().filter((l) => l.id !== id));
  }, []);

  const reorderLink = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    const current = readStorage();
    const fromIndex = current.findIndex((l) => l.id === fromId);
    const toIndex = current.findIndex((l) => l.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = current.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    writeStorage(next);
  }, []);

  const resetToDefaults = useCallback(() => {
    writeStorage(DEFAULT_LINKS);
  }, []);

  return {
    links,
    addLink,
    updateLink,
    removeLink,
    reorderLink,
    resetToDefaults,
  };
}
