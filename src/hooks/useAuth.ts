import { useCallback, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { firebaseConfigured, getFirebase } from '../lib/firebase';

export type AuthState = {
  user: User | null;
  ready: boolean;
  enabled: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!firebaseConfigured);

  useEffect(() => {
    const fb = getFirebase();
    if (!fb) return;
    return onAuthStateChanged(fb.auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async () => {
    const fb = getFirebase();
    if (!fb) return;
    await signInWithPopup(fb.auth, new GoogleAuthProvider());
  }, []);

  const signOut = useCallback(async () => {
    const fb = getFirebase();
    if (!fb) return;
    await fbSignOut(fb.auth);
  }, []);

  return { user, ready, enabled: firebaseConfigured, signIn, signOut };
}
