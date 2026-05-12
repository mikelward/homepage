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

## Roadmap

- Dark mode + user-configurable theme picker. CSS vars in
  `src/styles/global.css` are already structured for it.
- Tile reordering (drag handle).
- Inline weather card.
- Inline RSS reader.
- Link import / export.
