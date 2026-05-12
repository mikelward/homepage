import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
  plugins: [
    react(),
    !isTest &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'homepage',
          short_name: 'homepage',
          description: 'A minimal mobile home page.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // The per-site favicons <LinkIcon> resolves: each link's
              // /apple-touch-icon(-precomposed).png and the Google S2
              // fallback. Caching them here is what makes the tile grid
              // render fully offline after the first visit.
              urlPattern:
                /\/apple-touch-icon(-precomposed)?\.png$|\/\/www\.google\.com\/s2\/favicons/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'external-favicons',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          // The SW caches aggressively and makes iteration painful in dev.
          // Exercise the plugin via `npm run build && npm run preview`.
          enabled: false,
        },
      }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    pool: 'threads',
    css: false,
    unstubGlobals: true,
  },
});
