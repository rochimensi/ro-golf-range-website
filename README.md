# R&O Golf Range · Los Acantilados — website

React + Vite + GSAP.

- **Intro (horizontal):** `src/components/PuttIntro.jsx` pins the first screen with GSAP ScrollTrigger and scrubs the putt. The canvas scene (grass, putter, ball, hole, flag, yardage ruler) is in `src/putt/scene.js`.
- **Then vertical:** sections in `src/sections/`, with the yardage-sign indicator (30 → 300 yd) in `src/components/YardageNav.jsx`.
- **Styles:** `src/styles.css` (R&O design system tokens at the top).

## Run

```
npm install
npm run dev      # local dev server
npm run build    # static site in dist/
```

## Media

All media is in place; nothing is pending.

- `public/video/` — muted loop clips, each with a `.jpg` poster of the same name (`public/video/empresas/` for the sponsor formats).
- `public/img/` — photos and logos; `public/img/figma/` holds the photos exported from the Figma brochure pages.
- Sections without photos use rendered graphics (`src/components/ParticleShape.jsx`, `LineSketch.jsx`).
- Photo/video slots are listed in `MEDIA` (`src/pages/Academia.jsx`) and `PH` (`src/pages/OmarBio.jsx`). To swap one, replace the file under `public/` with the same name or change the path there; a missing file shows a labelled placeholder.
