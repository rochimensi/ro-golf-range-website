import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { startSmoothScroll, scrollToTarget } from './smoothScroll.js';
import { setupReveal } from './reveal.js';
import { homeScroll } from './route.js';
import PuttIntro from './components/PuttIntro.jsx';
import YardageNav from './components/YardageNav.jsx';
import HeroMenu from './components/HeroMenu.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import AcademiaTab from './components/AcademiaTab.jsx';
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


export default function Home({ returnTo = null }) {
  const root = useRef(null);

  useGSAP(() => {
    const stopSmooth = startSmoothScroll();

    const stopReveal = setupReveal(root.current);

    // Images change section heights as they load: recompute trigger positions.
    window.addEventListener('load', () => ScrollTrigger.refresh());
    // Coming back from the Academia page: land where the visitor left (menu, side tab or the Golf button),
    // not on the hero.
    let raf = 0;
    if (returnTo && homeScroll.y != null) {
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        scrollToTarget(homeScroll.y, { immediate: true });
        ScrollTrigger.update();
      });
    }
    return () => { homeScroll.y = window.scrollY; cancelAnimationFrame(raf); stopSmooth(); stopReveal(); };
  }, { scope: root, dependencies: [] });

  return (
    <div ref={root}>
      <PuttIntro />
      <YardageNav />
      <HeroMenu />
      <WhatsAppButton />
      <AcademiaTab />
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
