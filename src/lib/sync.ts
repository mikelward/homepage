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
import { isLinkEntry, type LinkEntry } from './links';
import { getFirebase } from './firebase';

function sameLinks(a: LinkEntry[], b: LinkEntry[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function coerceLinks(value: unknown): LinkEntry[] | null {
  if (!Array.isArray(value)) return null;
  return value.every(isLinkEntry) ? (value as LinkEntry[]) : null;
}

/**
 * Mirror the local links store to a per-user Firestore document. The remote
 * snapshot wins on first read so a freshly signed-in device picks up the
 * canonical state; if the remote doc is empty, the local list is uploaded.
 * After that it's last-write-wins through the snapshot listener.
 */
export function startSync(uid: string): () => void {
  const fb = getFirebase();
  if (!fb) return () => {};
  const ref = doc(fb.db, 'users', uid, 'state', 'links');

  let applyingRemote = false;
  let primed = false;

  const unsubRemote = onSnapshot(ref, (snap) => {
    const remote = coerceLinks(snap.data()?.links);
    if (remote === null) {
      if (!primed) {
        primed = true;
        void setDoc(ref, {
          links: readLinksStorage(),
          updatedAt: serverTimestamp(),
        });
      }
      return;
    }
    primed = true;
    if (sameLinks(remote, readLinksStorage())) return;
    applyingRemote = true;
    try {
      writeLinksStorage(remote);
    } finally {
      applyingRemote = false;
    }
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
