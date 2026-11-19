import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { startSmoothScroll } from './smoothScroll.js';
import PuttIntro from './components/PuttIntro.jsx';
import YardageNav from './components/YardageNav.jsx';
import HeroMenu from './components/HeroMenu.jsx';
import Canastos from './sections/Canastos.jsx';
import Clases from './sections/Clases.jsx';
import Golf from './sections/Golf.jsx';
// Enseñanza moves to its own Academia page.
// import Ensenanza from './sections/Ensenanza.jsx';
import Omar from './sections/Omar.jsx';
import Empresas from './sections/Empresas.jsx';
import Galeria from './sections/Galeria.jsx';
import Instagram from './sections/Instagram.jsx';
import Nosotros from './sections/Nosotros.jsx';
import Transformacion from './sections/Transformacion.jsx';
import Contacto from './sections/Contacto.jsx';
import Footer from './sections/Footer.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Never restore the previous scroll position on reload: every visit starts on the hero (see main.jsx).
// ScrollTrigger manages history.scrollRestoration itself, so the setting has to go through it.
ScrollTrigger.clearScrollMemory('manual');
if (import.meta.env.DEV || location.search.includes('debug')) window.ScrollTrigger = ScrollTrigger;

export default function App() {
  const root = useRef(null);

  useGSAP(() => {
    const stopSmooth = startSmoothScroll();

    // Reveal content as it scrolls into view (CSS handles the motion). An IntersectionObserver also
    // catches elements already on screen after a jump (anchor links, reloading partway down the page).
    const revealIO = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting)
        .forEach((e, i) => {
          setTimeout(() => e.target.classList.add('in'), i * 70);
          revealIO.unobserve(e.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });
    const REVEAL = '[data-reveal], .ph';
    root.current.querySelectorAll(REVEAL).forEach((el) => revealIO.observe(el));
    // Elements added later (a section re-rendered by hot reload while editing, or content that mounts
    // after load) would otherwise stay hidden at opacity 0: watch for them too.
    const revealMO = new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches(REVEAL) && !n.classList.contains('in')) revealIO.observe(n);
        n.querySelectorAll(REVEAL).forEach((el) => { if (!el.classList.contains('in')) revealIO.observe(el); });
      }));
    });
    revealMO.observe(root.current, { childList: true, subtree: true });

    // Photos not supplied yet (e.g. the Figma images) show a labelled placeholder instead.
    const markMissing = (img) => img.parentElement.classList.add('missing');
    root.current.querySelectorAll('img[data-fallback]').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) markMissing(img);
      else img.addEventListener('error', () => markMissing(img), { once: true });
    });

    // Images change section heights as they load: recompute trigger positions.
    window.addEventListener('load', () => ScrollTrigger.refresh());
    return () => { stopSmooth(); revealIO.disconnect(); revealMO.disconnect(); };
  }, { scope: root });

  return (
    <div ref={root}>
      <PuttIntro />
      <YardageNav />
      <HeroMenu />
      <main id="v">
        <Canastos />
        <Clases />
        <Golf />
        {/* Enseñanza moves to its own Academia page. */}
        {/* <Ensenanza /> */}
        <Omar />
        <Empresas />
        <Nosotros />
        <Transformacion />
        <Galeria />
        <Instagram />
        <Contacto />
        <Footer />
      </main>
    </div>
  );
}
