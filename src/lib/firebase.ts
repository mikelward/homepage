import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

export const firebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId && config.authDomain,
);

type Handles = { app: FirebaseApp; auth: Auth; db: Firestore };
let handles: Handles | null = null;

export function getFirebase(): Handles | null {
  if (!firebaseConfigured) return null;
  if (!handles) {
    const app = initializeApp(config);
    handles = { app, auth: getAuth(app), db: getFirestore(app) };
  }
  return handles;
}
