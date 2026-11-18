import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { pauseScroll } from '../smoothScroll.js';
import { CrossedTees } from './HeroMenu.jsx';

// The golf values as full-width lines: each value name repeats endlessly, alternating left / right.
// Hovering a line slows it almost to a stop and shows a "Ver" button that follows the cursor;
// clicking (or Enter, or a tap on phones, where there's no hover and no "Ver") opens the value in a floating card.
const REPEAT = 6;        // copies of the word in each half of a line (two halves make the seamless loop)
const SPEED = 70;        // px per second at full speed
const HOVER_SPEED = 0.04; // fraction of full speed while hovered

export default function ValuesMarquee({ values }) {
  const root = useRef(null);
  const cursor = useRef(null);
  const [open, setOpen] = useState(null); // { i, x, y } while the card is open

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = gsap.utils.toArray('.vm-line', root.current).map((el, i) => ({
      el,
      track: el.querySelector('.vm-track'),
      half: el.querySelector('.vm-half'),
      dir: i % 2 ? 1 : -1,                // 1st to the left, 2nd to the right, ...
      rate: 1 + (i % 3) * 0.12,           // slightly different pace per line
      speed: 1,
      x: 0,
      w: 1,
    }));
    const measure = () => lines.forEach((l) => { l.w = l.half.offsetWidth || 1; });
    measure();
    const ro = new ResizeObserver(measure);
    lines.forEach((l) => ro.observe(l.half));

    // Only move while the list is on screen.
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(root.current);

    const tick = (_t, dt) => {
      if (!visible || reduce) return;
      lines.forEach((l) => {
        l.x = gsap.utils.wrap(-l.w, 0, l.x + l.dir * SPEED * l.rate * l.speed * (dt / 1000));
        l.track.style.transform = `translate3d(${l.x}px,0,0)`;
      });
    };
    gsap.ticker.add(tick);

    // Hover: slow the line down and show the "Ver" button, which trails the cursor.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const c = cursor.current;
    const moveX = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
    const moveY = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    gsap.set(c, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    const offs = lines.map((l) => {
      const enter = (e) => {
        gsap.to(l, { speed: HOVER_SPEED, duration: 0.6, ease: 'power2.out', overwrite: true });
        if (!fine) return;
        if (gsap.getProperty(c, 'opacity') < 0.05) { gsap.set(c, { x: e.clientX, y: e.clientY }); }
        gsap.to(c, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' });
      };
      const leave = () => {
        gsap.to(l, { speed: 1, duration: 0.8, ease: 'power2.inOut', overwrite: true });
        if (fine) gsap.to(c, { scale: 0, opacity: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
      };
      const move = (e) => { if (fine) { moveX(e.clientX); moveY(e.clientY); } };
      l.el.addEventListener('pointerenter', enter);
      l.el.addEventListener('pointerleave', leave);
      l.el.addEventListener('pointermove', move);
      return () => {
        l.el.removeEventListener('pointerenter', enter);
        l.el.removeEventListener('pointerleave', leave);
        l.el.removeEventListener('pointermove', move);
      };
    });

    return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); offs.forEach((f) => f()); };
  }, { scope: root });

  const openCard = (i, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    // From the cursor when clicked; from the line's center for keyboard (no pointer position).
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;
    gsap.to(cursor.current, { scale: 0, opacity: 0, duration: 0.2 });
    setOpen({ i, x, y });
  };

  return (
    <div className="vm" ref={root}>
      <ul className="vm-list">
        {values.map(([name], i) => (
          <li key={name} className="vm-line">
            <button type="button" className="vm-btn" aria-label={`Ver ${name}`} aria-haspopup="dialog" onClick={(e) => openCard(i, e)}>
              <span className="vm-track" aria-hidden="true">
                {[0, 1].map((h) => (
                  <span key={h} className={h ? 'vm-half' : 'vm-half vm-first'}>
                    {Array.from({ length: REPEAT }, (_, k) => (
                      <span key={k} className="vm-item"><span className="vm-word">{name}</span></span>
                    ))}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {/* rendered on <body>, so the section's colors and any transformed ancestor can't affect them */}
      {createPortal(<div className="vm-cursor" ref={cursor} aria-hidden="true">Ver</div>, document.body)}
      {open && createPortal(<ValueCard values={values} open={open} onClose={() => setOpen(null)} returnFocus={root} />, document.body)}
    </div>
  );
}

// Floating card: grows out of the click point, closes with the tees button, Escape or a click outside.
function ValueCard({ values, open, onClose, returnFocus }) {
  const overlay = useRef(null);
  const card = useRef(null);
  const closeBtn = useRef(null);
  const [name, text] = values[open.i];
  const closing = useRef(false);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const { x, y } = fromClick();
    gsap.timeline({ onComplete: () => {
      onClose();
      returnFocus.current?.querySelectorAll('.vm-btn')[open.i]?.focus({ preventScroll: true });
    } })
      .to(card.current, { x, y, scale: 0.15, opacity: 0, duration: 0.35, ease: 'power3.in' })
      .to(overlay.current, { opacity: 0, duration: 0.25 }, '-=0.2');
  };

  // Offset from the card's resting center to the click point.
  const fromClick = () => ({ x: open.x - window.innerWidth / 2, y: open.y - window.innerHeight / 2 });

  useLayoutEffect(() => {
    const { x, y } = fromClick();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.timeline()
      .from(overlay.current, { opacity: 0, duration: reduce ? 0 : 0.3 })
      .from(card.current, { x, y, scale: 0.15, opacity: 0, duration: reduce ? 0 : 0.55, ease: 'power3.out' }, 0)
      .from(card.current.querySelectorAll('.vc-in'), { y: 14, opacity: 0, duration: reduce ? 0 : 0.4, stagger: 0.06, ease: 'power2.out' }, reduce ? 0 : 0.25);
    closeBtn.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    pauseScroll(true);
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.current?.focus(); } // only one control in the card
    };
    window.addEventListener('keydown', onKey);
    return () => { pauseScroll(false); window.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <div className="vc-overlay" ref={overlay} onClick={(e) => { if (e.target === overlay.current) close(); }}>
      <div className="vc-card" ref={card} role="dialog" aria-modal="true" aria-labelledby="vc-title">
        <button type="button" className="vc-close" aria-label="Cerrar" ref={closeBtn} onClick={close}><CrossedTees /></button>
        <h3 id="vc-title" className="display-l vc-in">{name}</h3>
        <p className="vc-in">{text}</p>
      </div>
    </div>
  );
}
