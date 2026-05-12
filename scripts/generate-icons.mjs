// Rasterize public/favicon.svg into the PNG sizes referenced by
// index.html and the PWA manifest. Run manually whenever the SVG
// changes:
//
//   npm run icons:generate
//
// Output PNGs are committed alongside the SVG so Vercel ships them
// without re-rasterizing on every build.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');

// sharp hands the SVG to librsvg, which renders at 72 DPI by default.
// At that density text/strokes downscale to a blurry intermediate.
// Bumping density to 384 keeps the 512×512 target crisp.
const INPUT_DENSITY = 384;

const TARGETS = [
  { name: 'favicon-32.png', size: 32, source: 'favicon.svg' },
  { name: 'apple-touch-icon.png', size: 180, source: 'favicon.svg' },
  { name: 'icon-192.png', size: 192, source: 'favicon.svg' },
  { name: 'icon-512.png', size: 512, source: 'favicon.svg' },
  { name: 'icon-512-maskable.png', size: 512, source: 'favicon-maskable.svg' },
];

async function main() {
  const svgCache = new Map();
  for (const { name, size, source } of TARGETS) {
    if (!svgCache.has(source)) {
      svgCache.set(source, await readFile(resolve(publicDir, source)));
    }
    const out = resolve(publicDir, name);
    await sharp(svgCache.get(source), { density: INPUT_DENSITY })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`wrote ${name} (${size}×${size}) from ${source}`);
  }
}

await main();
