import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { isPageHash } from './route.js';
import './styles.css';

// Every load (including a refresh) starts at the top, on the hero, with the putt ready to play:
// the scroll-restore switch is set through ScrollTrigger in App.jsx; here, drop any #section left in the
// address bar (except #academia / #acerca-de-omar, pages of their own) and make sure we're at the top before the page renders.
if (location.hash && !isPageHash(location.hash)) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

createRoot(document.getElementById('root')).render(<App />);
