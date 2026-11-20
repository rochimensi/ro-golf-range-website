import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE = 'https://rogolfrange.com.ar';

// Pages with an address of their own (see src/route.js). The build writes dist/<path>/index.html for each,
// with its own title, description, canonical and share (Open Graph) tags, so any static host serves /academia and /omar-peralta
// without rewrite rules, and Google sees the right tags before any JavaScript runs.
const PAGES = {
  academia: {
    title: 'Academia de Golf Omar Peralta · R&amp;O Golf Range · Mar del Plata',
    description: 'Academia de golf de Omar Peralta en Mar del Plata para estudiantes de 8 a 18 años: técnica, competencia y estudios, con College Placement para becas universitarias en el exterior.',
  },
  'omar-peralta': {
    title: 'Omar Peralta · Profesional de Golf · Biografía · R&amp;O Golf Range',
    description: 'Biografía de Omar Peralta, profesional de golf de Mar del Plata: jugador, caddie y profesor, con años en el PGA Tour y el DP World Tour. Hoy enseña en R&amp;O Golf Range.',
  },
};

function pageEntries() {
  return {
    name: 'page-entries',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
      for (const [path, { title, description }] of Object.entries(PAGES)) {
        const page = html
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${SITE}/${path}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${SITE}/${path}`);
        mkdirSync(resolve(dist, path), { recursive: true });
        writeFileSync(resolve(dist, path, 'index.html'), page);
      }
    },
  };
}

// base '/' (absolute asset paths) so the pages under /academia and /omar-peralta load their scripts and media.
export default defineConfig({
  base: '/',
  plugins: [react(), pageEntries()],
});
