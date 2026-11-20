// Runs after `vite build` and the SSR build (npm run build): puts each page's HTML inside <div id="root">
// of dist/index.html, dist/academia/index.html and dist/omar-peralta/index.html.
// The browser still renders the app from scratch (src/main.jsx), so animations start exactly as before.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// A few components read browser settings while rendering (e.g. reduced motion). Node has no browser, so give
// those reads a desktop-like stand-in: no preference set, a 1440×900 window. Effects never run here.
globalThis.window = globalThis;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.innerWidth = 1440;
globalThis.innerHeight = 900;
globalThis.location = { pathname: '/', search: '', hash: '' };   // links are built from it (src/route.js)
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);

const FILES = { home: 'dist/index.html', academia: 'dist/academia/index.html', omar: 'dist/omar-peralta/index.html' };

for (const [page, file] of Object.entries(FILES)) {
  const path = resolve(root, file);
  const html = readFileSync(path, 'utf8');
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) throw new Error(`${file}: empty <div id="root"></div> not found`);
  writeFileSync(path, html.replace(marker, `<div id="root" data-prerendered>${render(page)}</div>`));
  console.log(`prerendered ${file}`);
}
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
