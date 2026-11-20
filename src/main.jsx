import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App.jsx';
import { LEGACY_HASHES } from './route.js';
import './styles.css';

// Every load (including a refresh) starts at the top, on the hero, with the putt ready to play:
// the scroll-restore switch is set through ScrollTrigger in App.jsx; here, drop any #section left in the
// address bar (old #academia / #acerca-de-omar links are sent to their real paths) and make sure we're at the top before the page renders.
if (location.hash) history.replaceState(null, '', (LEGACY_HASHES[location.hash] || location.pathname) + location.search);
window.scrollTo(0, 0);

// Built pages arrive with prerendered HTML in #root (hidden by a style in index.html): render the app over it
// synchronously, so its layout effects (GSAP initial states) are in place before the root is shown.
const container = document.getElementById('root');
const root = createRoot(container);
flushSync(() => root.render(<App />));
container.removeAttribute('data-prerendered');
