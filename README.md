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

## Media to add

- `public/img/figma/` — photos from the Figma brochure pages: `omar-caddie.jpg`, `omar-swing.jpg`, `pga.png`, `omar-tour.jpg`, `omar-links.jpg`, `omar-bmw.jpg`, `olympics.jpg`, `worldcup.jpg`, `laguna.jpg`. Until a file exists, its slot shows a labelled placeholder.
- `public/video/` — gallery videos (9:16): `v01.mp4`, `v02.mp4`, `v03.mp4`.

`legacy-prototype.html` is the earlier single-file prototype, kept for reference.
