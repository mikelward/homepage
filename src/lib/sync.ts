import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  readLinksStorage,
  subscribeLinksStorage,
  writeLinksStorage,
} from '../hooks/useLinks';
import { DEFAULT_LINKS, isLinkEntry, type LinkEntry } from './links';
import { getFirebase } from './firebase';

const OWNER_KEY = 'homepage:links:owner';

function getLocalOwner(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(OWNER_KEY);
}

function setLocalOwner(uid: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(OWNER_KEY, uid);
}

function sameLinks(a: LinkEntry[], b: LinkEntry[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function coerceLinks(value: unknown): LinkEntry[] | null {
  if (!Array.isArray(value)) return null;
  return value.every(isLinkEntry) ? (value as LinkEntry[]) : null;
}

/**
 * Mirror the local links store to a per-user Firestore document. Remote
 * wins on first reconcile so a freshly signed-in device picks up the
 * canonical state. After that it's last-write-wins through the snapshot
 * listener.
 *
 * The local cache is tagged with the uid that owns it. On a shared
 * browser this prevents A's offline links from being uploaded into B's
 * brand-new account when B signs in next: we only seed an empty remote
 * from localStorage when the cache is unclaimed or already owned by the
 * signing-in user.
 */
export function startSync(uid: string): () => void {
  const fb = getFirebase();
  if (!fb) return () => {};
  const ref = doc(fb.db, 'users', uid, 'state', 'links');

  let applyingRemote = false;
  let primed = false;

  const applyRemote = (links: LinkEntry[]) => {
    applyingRemote = true;
    try {
      writeLinksStorage(links);
    } finally {
      applyingRemote = false;
    }
  };

  const unsubRemote = onSnapshot(ref, (snap) => {
    const remote = coerceLinks(snap.data()?.links);
    if (remote === null) {
      if (primed) return;
      primed = true;
      const owner = getLocalOwner();
      if (owner === null || owner === uid) {
        // Unclaimed cache or our own cache — safe to migrate up.
        setLocalOwner(uid);
        void setDoc(ref, {
          links: readLinksStorage(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // The local cache belongs to a different user. Discard it and
        // seed the new account with defaults instead of leaking links.
        applyRemote(DEFAULT_LINKS);
        setLocalOwner(uid);
        void setDoc(ref, {
          links: DEFAULT_LINKS,
          updatedAt: serverTimestamp(),
        });
      }
      return;
    }
    primed = true;
    setLocalOwner(uid);
    if (!sameLinks(remote, readLinksStorage())) applyRemote(remote);
  });

  const unsubLocal = subscribeLinksStorage(() => {
    if (applyingRemote || !primed) return;
    void setDoc(ref, {
      links: readLinksStorage(),
      updatedAt: serverTimestamp(),
    });
  });

  return () => {
    unsubRemote();
    unsubLocal();
  };
}
