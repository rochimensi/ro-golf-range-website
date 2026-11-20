import { renderToString } from 'react-dom/server';
import Home from './Home.jsx';
import Academia from './pages/Academia.jsx';
import OmarBio from './pages/OmarBio.jsx';

// Build-time only (see scripts/prerender.js): each page rendered to plain HTML, so search engines and
// link previews read the text without running JavaScript. Effects (GSAP, Lenis, canvas, video) don't run here.
const PAGES = { home: Home, academia: Academia, omar: OmarBio };

export function render(page) {
  const Page = PAGES[page];
  return renderToString(<Page />);
}
