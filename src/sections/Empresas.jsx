import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AutoplayVideo from '../components/AutoplayVideo.jsx';

// 150 yd · Acciones comerciales (design: canvas "Acciones Comerciales", option C).
// Two goals: brands sponsoring the space (reel of formats + brand badges) and companies booking
// a team-building day (Golf Pass ticket).

const PILLS = ['Exposición anual o por temporada', 'Activaciones por día', 'Contenido para redes'];

// Reel of real activations at the range. `video` clips live in public/video/empresas/ (+ poster .jpg).
const FORMATS = [
  { video: 'callaway', format: 'Fly banners', brand: 'Callaway' },
  { video: 'taylormade', format: 'Gazebo y stand', brand: 'TaylorMade' },
  { video: 'remax', format: 'Inflables', brand: 'RE/MAX' },
  { image: 'img/empresas-carteles.jpg', format: 'Carteles en gateras', brand: 'Giometti Propiedades' },
  { video: 'restinga', format: 'Carteles en campo de juego', brand: 'Restinga' },
  { video: 'calej', format: 'Sampling productos', brand: 'Cosmetóloga Cristina Fernandez · Calej' },
  { video: 'macro', format: 'Mobiliario', brand: 'Macro' },
  { video: 'steelbox', format: 'Branding de muro', brand: 'Steel Box' },
  { video: 'giometti', format: 'Stand de atención', brand: 'Giometti Propiedades' }
];

// Brand grid (tic-tac-toe lines, gold, dashed). Names for now; swap for the official logos once each
// brand approves them. The CTA fills the cells left over in the last row.
const BRANDS = ['Macro', 'TaylorMade', 'Callaway', 'RE/MAX', 'Allianz', ,
  'Giometti Propiedades', 'Andrea Peralta Real Estate', 'Cosmetóloga Cristina Fernandez', 'Restinga'];

// Grid reveal scene, same as Clases (reuses its .clases-grid / .cl-cover styles): the first screen pins
// and arrives green with a big "ACCIONES COMERCIALES"; columns drop away revealing the cream, the heading
// drops out, then the brands intro and the reel come in, all tied to the scroll.
const COLS = 16;
const COVER_LINES = ['Acciones', 'comerciales'];
const LEAD_LINES = [['Tu', 'marca'], ['en', 'el', 'range']];

const Cover = ({ className = '' }) => (
  <div className={`cl-cover emp-cover ${className}`} aria-hidden="true">
    {COVER_LINES.map((line) => (
      <span key={line} className="cl-title">
        {[...line].map((ch, i) => <span key={i} className="cl-letter">{ch}</span>)}
      </span>
    ))}
  </div>
);

const PASS = [
  { k: 'Incluye', v: 'Clínica con el Director de la Academia' },
  { k: 'Equipamiento', v: 'Todo incluido' },
  { k: 'Grupo', v: 'Hasta 30 personas' },
  { k: 'Duración', v: 'A convenir' }
];

// Slow automatic drift for the reel (px per second). Each card appears once: the reel drifts to the
// end, waits, then drifts back to the start. It never fights the visitor:
// - mouse: pauses while the pointer is over it;
// - touch (phones, iPad): any scroll the reel didn't make itself (a swipe and its momentum, a trackpad
//   flick) pauses it until the reel has been still for a few seconds; on touch screens the drift stops
//   for good after the first swipe, so native scrolling takes over;
// - off screen, before the scroll scene has shown it, and for reduced motion it doesn't move.
const REEL_SPEED = 28;
const REEL_END_PAUSE = 1800; // ms of rest at each end
const REEL_IDLE_AFTER_USER = 3000; // ms of stillness before it drifts again after a manual scroll

function useAutoReel(ref, ready) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    let pos = 0;          // float position, written to scrollLeft in whole pixels
    let written = -1;     // last scrollLeft the reel set itself
    let dir = 1;
    let last = 0;
    let raf = 0;
    let hovered = false;
    let touching = false;
    let stopped = false;  // touch screens: the visitor took over
    let onScreen = false;
    let holdUntil = 0;
    let wasReady = false;

    const setScroll = (x) => {
      const px = Math.round(x);
      if (px !== written) { written = px; el.scrollLeft = px; }
    };
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      if (stopped) return;
      // Until the scroll scene has shown the reel, keep it parked on the first card.
      if (!ready.current) {
        if (!touching) { pos = 0; dir = 1; setScroll(0); }
        wasReady = false;
        return;
      }
      if (!wasReady) { wasReady = true; pos = el.scrollLeft; holdUntil = t + 1500; return; }
      if (hovered || touching || !onScreen || t < holdUntil) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      pos += REEL_SPEED * dt * dir;
      if (pos >= max || pos <= 0) {
        pos = Math.min(Math.max(pos, 0), max);
        dir = pos >= max ? -1 : 1;
        holdUntil = t + REEL_END_PAUSE;
      }
      setScroll(pos);
    };

    // A scroll the reel didn't make: the visitor is moving it (swipe, momentum, trackpad).
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - written) <= 1) return;
      written = el.scrollLeft;
      pos = el.scrollLeft;
      holdUntil = performance.now() + REEL_IDLE_AFTER_USER;
      if (coarse && ready.current) stopped = true;
    };
    const onEnter = (e) => { if (e.pointerType === 'mouse') hovered = true; };
    const onLeave = (e) => { if (e.pointerType === 'mouse') { hovered = false; pos = el.scrollLeft; holdUntil = performance.now() + 1200; } };
    const onTouchStart = () => { touching = true; };
    const onTouchEnd = () => { touching = false; pos = el.scrollLeft; holdUntil = performance.now() + REEL_IDLE_AFTER_USER; };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; });
    io.observe(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [ref, ready]);
}

// Golf Pass outline: one continuous SVG path around the ticket with the scalloped sides (punch-outs of
// radius 13px every 38px, centred on the middle). It starts at the bottom-left corner so the reveal draws
// the left side (upwards), then the top, the right side (downwards) and ends with the bottom.
const SCALLOP_R = 13;
const SCALLOP_STEP = 38;

function ticketPath(w, h, inset = 1) {
  const x0 = inset; const y0 = inset; const x1 = w - inset; const y1 = h - inset; const r = SCALLOP_R;
  const centres = [];
  for (let y = h / 2 - Math.floor((h / 2 - r - 4) / SCALLOP_STEP) * SCALLOP_STEP; y <= h - r - 4; y += SCALLOP_STEP) centres.push(y);
  let d = `M${x0},${y1}`;
  [...centres].reverse().forEach((c) => { d += ` L${x0},${c + r} A${r},${r} 0 0 0 ${x0},${c - r}`; });
  d += ` L${x0},${y0} L${x1},${y0}`;
  centres.forEach((c) => { d += ` L${x1},${c - r} A${r},${r} 0 0 0 ${x1},${c + r}`; });
  d += ` L${x1},${y1} Z`;
  return d;
}

function useTicketDraw(ticketRef, pathRef) {
  useEffect(() => {
    const el = ticketRef.current; const path = pathRef.current;
    if (!el || !path) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let drawn = reduce;
    let tween = null;
    const layout = () => {
      const { offsetWidth: w, offsetHeight: h } = el;
      path.parentNode.setAttribute('viewBox', `0 0 ${w} ${h}`);
      path.setAttribute('d', ticketPath(w, h));
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      if (!tween) path.style.strokeDashoffset = drawn ? '0' : `${len}`;
    };
    layout();
    if (drawn) el.classList.add('gt-done');
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const st = drawn ? null : ScrollTrigger.create({
      trigger: el,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        drawn = true;
        tween = gsap.to(path, {
          strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
          onUpdate() { if (this.progress() > 0.7) el.classList.add('gt-done'); },
          onComplete: () => { tween = null; el.classList.add('gt-done'); },
        });
      },
    });
    return () => { ro.disconnect(); st?.kill(); tween?.kill(); };
  }, [ticketRef, pathRef]);
}

export default function Empresas() {
  const scene = useRef(null);
  const reel = useRef(null);
  const reelReady = useRef(false);
  useAutoReel(reel, reelReady);
  const ticket = useRef(null);
  const ticketLine = useRef(null);
  useTicketDraw(ticket, ticketLine);

  useGSAP(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { reelReady.current = true; return; }
    const ease = 'power3.out';
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    // 1. Columns drop; the cream copy of the heading inside each column moves the opposite way.
    tl.to('.clases-col', { yPercent: 101, duration: 0.4, stagger: { amount: 0.6 } }, 0)
      .to('.clases-col-inner', { yPercent: -101, duration: 0.4, stagger: { amount: 0.6 } }, 0);

    // 2. Grid full: the heading drops away.
    tl.to('.cl-cover-ink .cl-letter', { yPercent: 110, opacity: 0, duration: 0.2, ease: 'power2.in', stagger: { amount: 0.16 } }, 1.05);

    // 3. Content comes in, quickly, and the section unpins as soon as it's all shown (no hold at the end).
    const c = 1.3;
    tl.from('.clases-word', { yPercent: 110, duration: 0.2, ease, stagger: 0.03 }, c + 0.05)
      .from('.emp-lead-text .body-l', { y: 20, opacity: 0, duration: 0.15, ease }, c + 0.2)
      .from('.emp-pills li', { y: 12, scale: 0.85, opacity: 0, duration: 0.12, ease: 'back.out(2)', stagger: 0.04 }, c + 0.25)
      // reel cards simply fade in, one after another
      .from('.emp-card figure', { opacity: 0, duration: 0.3, ease: 'power1.out', stagger: { amount: 0.25 } }, c + 0.15);

    ScrollTrigger.create({
      animation: tl,
      trigger: scene.current,
      start: 'top top',
      // 0.85 screens of scroll per timeline unit
      end: () => `+=${tl.duration() * window.innerHeight * 0.85}`,
      pin: true,
      scrub: 0.4,
      invalidateOnRefresh: true,
      // the reel starts drifting only once the scene has finished showing it
      onUpdate: (self) => { reelReady.current = self.progress > 0.95; },
    });
  }, { scope: scene });

  return (
    <section id="empresas" className="vs cream emp" data-sec={150}>
      {/* Marcas: pinned grid scene */}
      <div ref={scene} className="clases emp-scene">
      <Cover className="cl-cover-ink" />
      <div className="clases-grid" aria-hidden="true">
        {Array.from({ length: COLS }, (_, i) => (
          <span key={i} className="clases-col" style={{ '--i': i }}>
            <span className="clases-col-inner"><Cover /></span>
          </span>
        ))}
      </div>
      <div className="emp-scene-in">
      <div className="wrap">
        <div className="emp-lead">
          <h2 className="emp-title" aria-label="Tu marca en el range">
            {LEAD_LINES.map((line, l) => (
              <span key={l} className="emp-title-line" aria-hidden="true">
                {line.map((w) => <span key={w} className="clases-word-mask"><span className="clases-word">{w}</span></span>)}
              </span>
            ))}
          </h2>
          <div className="emp-lead-text">
            <p className="body-l">Estas marcas ya pasaron por el range. Cada formato se adapta a tu campaña: por día, por temporada o todo el año.</p>
            <ul className="emp-pills">
              {PILLS.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <ul ref={reel} className="emp-reel" aria-label="Formatos de publicidad en el range">
        {FORMATS.map(({ video, image, format, brand }) => (
          <li key={format + brand} className="emp-card">
            <figure>
              <div className="emp-media">
                {video ? (
                  <AutoplayVideo src={`video/empresas/${video}.mp4`} poster={`video/empresas/${video}.jpg`} preload="metadata" aria-label={`${format} · ${brand}`} />
                ) : (
                  <img src={image} alt={`${format} · ${brand}`} loading="lazy" />
                )}
              </div>
              <figcaption>
                <span className="emp-format">{format}</span>
                <span className="emp-brand">{brand}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      </div>
      </div>

      <div className="wrap">
        <div className="emp-brands" data-reveal>
          <div className="label">Ya activaron su marca en el range</div>
          <ul className="emp-grid">
            {BRANDS.map((b) => <li key={b} className="emp-cell">{b}</li>)}
            <li className="emp-cell emp-cell-cta">
              <a className="btn academia" href="#contacto">Quiero publicitar en R&amp;O Golf Range</a>
            </li>
          </ul>
        </div>

        {/* Empresas: Golf Pass */}
        <header className="vh center emp-tb" data-reveal>
          <div className="label">Team building</div>
          <h3 className="display-l">Un día de golf para tu empresa</h3>
          <div className="rule mx" />
          <p className="emp-q">¿Y si el próximo gran momento de tu equipo sucede fuera de la oficina?</p>
          <p className="body-l">Viví una jornada de golf para empresas pensada para disfrutar, conectar y fortalecer vínculos en R&amp;O Golf Range, Mar del Plata.</p>
        </header>

        <div className="gt-wrap" data-reveal>
          <article className="gt" ref={ticket}>
            <svg className="gt-outline" aria-hidden="true" preserveAspectRatio="none"><path ref={ticketLine} /></svg>
            <div className="gt-side"><span className="gt-up">Admite a todo tu equipo</span></div>
            <div className="gt-main">
              <img className="gt-logo" src="img/logo.jpg" alt="R&amp;O Golf Range" width="60" height="60" />
              <div className="gt-kicker">R&amp;O Golf Range · Empresas</div>
              <h4 className="gt-title">Golf Pass</h4>
              <div className="gt-sub"><span aria-hidden="true" />Jornada de team building<span aria-hidden="true" /></div>
              <dl className="gt-row">
                {PASS.map(({ k, v }) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <p className="gt-note">Sin experiencia previa, cualquier rango de edades. Práctica techada si llueve.</p>
              <a className="btn academia gt-cta" href="#contacto">Reservá tu Golf Pass</a>
            </div>
            <div className="gt-side right"><span className="gt-up">Nº 0001 · Mar del Plata</span></div>
          </article>
        </div>
      </div>
    </section>
  );
}
