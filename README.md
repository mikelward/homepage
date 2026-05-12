# homepage

A minimal mobile PWA new-tab page. Tile grid of icon buttons — tap a tile to
navigate, hit **Edit** to add / rename / delete. Works fully offline once
installed.

Live: _add deploy URL_

## Stack

Vite + React + TypeScript on Vercel, mirroring
[`mikelward/newshacker`](https://github.com/mikelward/newshacker). PWA via
[`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/). Tests with Vitest +
Testing Library on happy-dom.

## Local development

```bash
npm install
npm run dev           # Vite dev server (PWA disabled in dev)
npm run typecheck
npm run lint
npm test
npm run build         # tsc + vite build, generates the service worker
npm run preview       # serves dist/ — use this to test PWA install + offline
npm run icons:generate  # rasterize public/favicon.svg into PNG sizes
```

## Deployment

Vercel auto-detects the Vite preset. `vercel.json` only rewrites SPA routes
back to `index.html` (there's no `/api` yet).

## Sync (optional)

Signed-in users can sync their tile grid across devices via Firebase Auth
(Google) + Firestore. The feature is gated by env vars — leave them unset
and the app runs as a pure local PWA exactly as before.

1. Create a Firebase project, enable **Authentication → Google** and
   **Firestore Database** (production mode).
2. Add a web app and copy its config into a local `.env`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   Add the same vars to your Vercel project settings for the deployed build.

3. Lock down Firestore so each user can only touch their own document:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

State lives at `users/{uid}/state/links`. The client uses last-write-wins:
on sign-in the remote doc is the source of truth, then either side's
mutations stream through the snapshot listener.

## Roadmap

- Dark mode + user-configurable theme picker. CSS vars in
  `src/styles/global.css` are already structured for it.
- Tile reordering (drag handle).
- Inline weather card.
- Inline RSS reader.
- Link import / export.
