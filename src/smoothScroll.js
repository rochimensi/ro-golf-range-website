import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Smooth scrolling for the whole page (Lenis), driven by GSAP's ticker so ScrollTrigger animations
// stay in sync. Each wheel or trackpad movement eases out to a gentle stop instead of halting abruptly.
// Visitors with reduced motion get the browser's normal scrolling.
let lenis = null;

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  lenis = new Lenis({
    lerp: 0.085,          // lower = longer, softer glide to a stop
    wheelMultiplier: 1,
    smoothWheel: true,
    anchors: true,        // in-page links (the yardage signs, "Conocé a Omar") glide too
  });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(raf); lenis.destroy(); lenis = null; };
}

// Scroll helpers that use Lenis when it's running and fall back to the browser otherwise.
export function scrollToTarget(target, { immediate = false } = {}) {
  if (lenis) { lenis.scrollTo(target, { immediate }); return; }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth' });
}

export function pauseScroll(paused) {
  if (lenis) paused ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = paused ? 'hidden' : '';
}
