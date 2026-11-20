import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SIGNS, inRange } from './YardageNav.jsx';
import { scrollToTarget, pauseScroll } from '../smoothScroll.js';
import { linkTo } from '../route.js';

// Two golf tees crossed into an X, heads up: the panel's close button (Figma 3246:2019).
export function CrossedTees() {
  return (
    <svg className="ct" viewBox="0 0 24 24" aria-hidden="true">
      <path className="ct-tee ct-a" d="M18.8709 0C19.6546 2.18614 21.1395 3.67106 23.3257 4.45477L21.7789 5.75408C21.1602 6.04282 20.4486 5.95001 19.6443 5.47566L7.1462 17.3551L2.22738 21.0983L5.97063 16.1795L17.85 3.68137C17.3757 2.87704 17.2829 2.16551 17.5716 1.5468L18.8709 0Z" />
      <path className="ct-tee ct-b" d="M4.45477 0C3.67106 2.18614 2.18614 3.67106 5.06289e-07 4.45477L1.5468 5.75408C2.16551 6.04282 2.87704 5.95001 3.68137 5.47566L16.1795 17.3551L21.0983 21.0983L17.3551 16.1795L5.47566 3.68137C5.95001 2.87704 6.04282 2.16551 5.75408 1.5468L4.45477 0Z" />
    </svg>
  );
}

// Menu button for the putt intro, top right: a small yardage sign standing on its post. It opens a
// full-height panel with the same sections as the yardage rail, and hides once Canastos is on screen
// (where the rail takes over), so there's only ever one menu on screen. Phones have no rail (see
// styles.css), so there the button stays on for the whole page.
const PHONE = '(max-width: 760px)';
export default function HeroMenu() {
  const root = useRef(null);
  const btn = useRef(null);
  const panel = useRef(null);
  const [open, setOpen] = useState(false);

  // Hide once Canastos is on screen, the same moment the yardage rail slides in (except on phones).
  useGSAP(() => {
    const el = root.current;
    const phone = window.matchMedia(PHONE);
    // `off` only marks "past the hero"; on phones the CSS keeps the button visible anyway. (Deciding the
    // phone case here failed on iPhone: at the very first check the phone breakpoint and the page height
    // weren't settled yet, so the button started hidden and stayed hidden until something re-measured.)
    const toggle = (st) => {
      const past = inRange(st);   // real scroll position, not the possibly stale `isActive` (see YardageNav)
      el.classList.toggle('off', past);
      if (past && !phone.matches) setOpen(false);
    };
    const st = ScrollTrigger.create({
      trigger: document.getElementById('canastos'),
      endTrigger: document.getElementById('v'),
      start: 'top bottom',
      end: 'bottom top',
      onToggle: toggle,
      onRefresh: toggle,
      refreshPriority: -1, // measure after the pinned sections add their scroll space (as the yardage rail does)
    });
    // Rotating a tablet or resizing a window can cross the phone breakpoint.
    const onChange = () => toggle(st);
    phone.addEventListener('change', onChange);
    return () => phone.removeEventListener('change', onChange);
  }, { scope: root });

  // While open: the page doesn't scroll, Escape closes, Tab stays inside the panel, and focus moves to
  // the first section (and back to the sign button on close).
  useEffect(() => {
    if (!open) return undefined;
    pauseScroll(true);
    const focusables = () => [...panel.current.querySelectorAll('button, a')];
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => panel.current?.querySelector('a')?.focus({ preventScroll: true }), 80);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); pauseScroll(false); };
  }, [open]);

  const close = () => { setOpen(false); btn.current?.focus({ preventScroll: true }); };
  const go = (e, id) => {
    e.preventDefault();
    pauseScroll(false);   // smooth scrolling has to be running again before it can glide to the section
    setOpen(false);
    scrollToTarget(`#${id}`);
  };

  return (
    <div id="hero-menu" ref={root} className={open ? 'open' : ''}>
      <button
        ref={btn}
        type="button"
        className="hm-btn"
        aria-expanded={open}
        aria-controls="hero-menu-panel"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <rect className="hm-post" x="14.5" y="20.5" width="3" height="7.5" />
          <g className="hm-sign">
            <rect className="hm-board" x="4" y="5" width="24" height="16" rx="2.5" />
            <line className="hm-ln" x1="9.5" y1="9.5" x2="22.5" y2="9.5" />
            <line className="hm-ln" x1="9.5" y1="13" x2="22.5" y2="13" />
            <line className="hm-ln" x1="9.5" y1="16.5" x2="22.5" y2="16.5" />
          </g>
        </svg>
      </button>

      <div className="hm-scrim" onClick={close} aria-hidden="true" />
      <div id="hero-menu-panel" ref={panel} className="hm-panel" role="dialog" aria-modal="true" aria-label="Menú">
        <button type="button" className="hm-close" aria-label="Cerrar menú" onClick={close}>
          <CrossedTees />
        </button>
        <nav aria-label="Secciones del sitio">
          <ul>
            {SIGNS.map((s, i) => (
              <li key={s.yd} style={{ '--i': i }}>
                <a href={`#${s.id}`} onClick={(e) => go(e, s.id)}>
                  <b>{s.yd}</b><span>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* The Academia is its own page, so it gets its own button under the sections */}
        <a className="btn academia hm-academia" style={{ '--i': SIGNS.length }} {...linkTo('academia')}>
          Academia Omar Peralta <span className="hm-ac-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}
