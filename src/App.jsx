import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Home from './Home.jsx';
import Academia from './pages/Academia.jsx';
import OmarBio from './pages/OmarBio.jsx';
import { currentRoute, ROUTE_EVENT } from './route.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Never restore the previous scroll position on reload: every visit starts on the hero (see main.jsx).
// ScrollTrigger manages history.scrollRestoration itself, so the setting has to go through it.
ScrollTrigger.clearScrollMemory('manual');
if (import.meta.env.DEV || location.search.includes('debug')) window.ScrollTrigger = ScrollTrigger;

// The home page plus two pages: Academia (#academia) and Omar's biography (#acerca-de-omar), see route.js.
export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const prev = useRef(null);

  useEffect(() => {
    const sync = () => setRoute((r) => { prev.current = r; return currentRoute(); });
    const evts = ['popstate', 'hashchange', ROUTE_EVENT];
    evts.forEach((e) => window.addEventListener(e, sync));
    return () => evts.forEach((e) => window.removeEventListener(e, sync));
  }, []);

  useEffect(() => {
    document.title = {
      academia: 'Academia Omar Peralta · R&O Golf Range · Mar del Plata',
      omar: 'Omar Peralta · Biografía · R&O Golf Range',
    }[route] || 'R&O Golf Range · Los Acantilados · Mar del Plata';
  }, [route]);

  if (route === 'academia') return <Academia key="academia" />;
  if (route === 'omar') return <OmarBio key="omar" />;
  // back from one of the pages → land where the visitor left the home page
  return <Home key="home" returnTo={prev.current != null && prev.current !== 'home'} />;
}
