import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { startSmoothScroll, scrollToTarget } from '../smoothScroll.js';
import { setupReveal } from '../reveal.js';
import { linkTo } from '../route.js';
import { WHATSAPP } from '../components/WhatsAppButton.jsx';
import AutoplayVideo from '../components/AutoplayVideo.jsx';
import ScrollHighlight from '../components/ScrollHighlight.jsx';
import ParticleShape from '../components/ParticleShape.jsx';
import Footer from '../sections/Footer.jsx';
import './academia.css';

const WA_LINK = `${WHATSAPP}?text=${encodeURIComponent('Hola! Quiero conversar con Omar sobre la opción de Becas Universitarias por Golf')}`;

/*
  MEDIA — every photo/video slot on the page. To use your own, drop the file at public/<src> (same name)
  or change the path here. A slot whose file doesn't exist yet shows a striped placeholder with its path.
  (The other sections use ParticleShape graphics instead of photos.)
  Videos: muted loop, 720 px wide is plenty (same treatment as the home page clips).
*/
const MEDIA = {
  hero:    { type: 'video', src: '/video/academia-hero.mp4', poster: '/video/academia-hero.jpg', label: 'Video principal · vertical 4:5' },
  cta:     { type: 'image', src: '/img/academia-hoy.jpg', alt: 'Edificio de la Academia Omar Peralta en R&O Golf Range', label: 'Academia · foto 4:5' },
};

const CHAPTERS = [
  { key: 'tecnica', name: 'Técnica', kicker: 'Las bases de cada golpe.', items: [
    'Técnica de los golpes básicos',
    'Postura y Grip',
    'Mecánica del Swing y análisis del movimiento',
    'Uso y conocimiento de los diferentes palos',
  ] },
  { key: 'juego', name: 'El juego', kicker: 'Del tee al green, y cómo pensar cada hoyo.', items: [
    'Juego Corto y Juego Largo',
    'Lectura de Green y Técnicas de Putt',
    'Estrategia de juego y toma de decisiones, planificación de rondas y torneos',
  ] },
  { key: 'campo', name: 'El campo', kicker: 'Las reglas y el respeto.', items: [
    'Reglas básicas y avanzadas del Golf',
    'Etiqueta y comportamiento en el campo, respeto por los compañeros y el juego',
  ] },
  { key: 'mente', name: 'Mente y cuerpo', kicker: 'La fortaleza que no se ve.', items: [
    'Manejo de las frustraciones y control mental',
    'Preparación física específica para el golf',
  ] },
];

// Particle icons used where there are no photos (components/ParticleShape.jsx)
const CHAPTER_SHAPES = { tecnica: 'grip', juego: 'flag', campo: 'rules', mente: 'mind' };
const OFFER_SHAPES = ['oneone', 'book', 'trophy', 'globe'];

const OFFERS = [
  { stop: 'Coaching 1:1', t: 'Coaching profesional individual', s: '1:1', d: 'Trabajo personalizado, uno a uno, con Omar.' },
  { stop: 'Estudio + golf', t: 'Seguimiento académico y deportivo integrado', d: 'Diseñado para armonizar los estudios académicos con el entrenamiento deportivo.' },
  { stop: 'Torneos', t: 'Torneos nacionales y clasificaciones juveniles', d: 'Participación en el circuito competitivo, con planificación de cada torneo.' },
  { stop: 'Universidades', t: 'Orientación estratégica', d: 'Para apoyar las solicitudes a universidades en el extranjero.' },
];

const AGES = Array.from({ length: 11 }, (_, i) => 8 + i);

// One photo or video slot. Missing file → striped placeholder that names the file to add.
function Media({ m, className = '', ...rest }) {
  const [missing, setMissing] = useState(false);
  return (
    <figure className={`ac-media ${className}${missing ? ' missing' : ''}`} {...rest}>
      {m.type === 'video'
        ? <AutoplayVideo lazy src={m.src} poster={m.poster} onError={() => setMissing(true)} aria-hidden="true" />
        : <img src={m.src} alt={m.alt || ''} loading="lazy" onError={() => setMissing(true)} />}
      <figcaption className="missing-note">{m.label}<br />public/{m.src}</figcaption>
    </figure>
  );
}

// Letters wrapped for the rise-in animation; the heading keeps its plain text for screen readers.
const Chars = ({ text }) => [...text].map((c, i) => (
  <span key={i} className="ac-ch" aria-hidden="true">{c === ' ' ? ' ' : c}</span>
));

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="ac-wa-ico" aria-hidden="true">
    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
    <path d="M9 9.5c.3 2 2.3 4.4 5 5l1.2-1.2 2 1-.6 1.6c-3.6.4-8.4-3.6-8.4-8l1.6-.6 1 2z" />
  </svg>
);

export default function Academia() {
  const root = useRef(null);
  const [chapter, setChapter] = useState(0);
  const [offer, setOffer] = useState(0);

  // In-page jumps (#ensena, #college) scroll smoothly without touching the address bar (which holds the route).
  const jump = (id) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToTarget(document.getElementById(id));
  };

  useGSAP(() => {
    window.scrollTo(0, 0);
    const stopSmooth = startSmoothScroll();
    const stopReveal = setupReveal(root.current);
    const q = gsap.utils.selector(root);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Top bar slides in once the hero has gone by
    ScrollTrigger.create({
      trigger: q('.ac-hero')[0], start: 'bottom 72px',
      onToggle: (st) => q('.ac-bar')[0].classList.toggle('on', st.isActive),
      onRefresh: (st) => q('.ac-bar')[0].classList.toggle('on', st.progress > 0),
      end: () => '+=' + document.documentElement.scrollHeight,
    });

    // Active chapter: the one crossing the middle of the screen drives the sticky photo/video
    q('.ac-ch-block').forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && setChapter(i) });
    });

    if (reduced) { q('.ac-of-panel').forEach((p) => p.classList.add('on')); q('.ac-fp-path').forEach((p) => { p.style.strokeDasharray = 'none'; }); return () => { stopSmooth(); stopReveal(); }; }

    // ---- Hero: letters rise, then copy, then the video opens from the bottom ----
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
    tl.from(q('.ac-hero .ac-kicker'), { opacity: 0, y: 14, duration: 0.6 })
      .from(q('.ac-hero .ac-ch'), { yPercent: 110, duration: 0.9, stagger: 0.035 }, '-=0.3')
      .from(q('.ac-hero .ac-rule-grow'), { scaleX: 0, transformOrigin: 'left center', duration: 0.8 }, '-=0.5')
      .from(q('.ac-hero-lead, .ac-hero-index > *'), { opacity: 0, y: 20, duration: 0.7, stagger: 0.1 }, '-=0.5')
      .fromTo(q('.ac-hero-media'), { clipPath: 'inset(100% 0% 0% 0% round 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.35)
      .from(q('.ac-hero-media video'), { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0.6)
      .from(q('.ac-cue'), { opacity: 0, duration: 0.6 }, '-=0.4');

    // gentle parallax on the hero video and the big outline word
    gsap.to(q('.ac-hero-media'), { yPercent: -10, ease: 'none', scrollTrigger: { trigger: q('.ac-hero')[0], start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(q('.ac-hero-ghost'), { xPercent: -18, ease: 'none', scrollTrigger: { trigger: q('.ac-hero')[0], start: 'top top', end: 'bottom top', scrub: true } });

    // ---- Chapters: progress line on the sticky panel ----
    gsap.fromTo(q('.ac-progress i'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('.ac-chapters')[0], start: 'top 55%', end: 'bottom 55%', scrub: true } });

    // ---- Quote: giant outline phrase drifts behind it ----
    gsap.fromTo(q('.ac-quote-bg span'), { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: q('.ac-quote')[0], start: 'top bottom', end: 'bottom top', scrub: true } });

    // ---- College: the ball flies from school to university as you scroll ----
    const path = q('.ac-fp-path')[0];
    const ball = q('.ac-fp-ball')[0];
    const stops = q('.ac-fp-stop');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const fly = { p: 0 };
    const place = () => {
      const pt = path.getPointAtLength(len * fly.p);
      path.style.strokeDashoffset = len * (1 - fly.p);
      ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y);
      stops.forEach((s) => s.classList.toggle('on', fly.p >= Number(s.dataset.at) - 0.001));
    };
    place();
    gsap.to(fly, { p: 1, ease: 'none', onUpdate: place, scrollTrigger: { trigger: q('.ac-fp')[0], start: 'top 80%', end: 'bottom 40%', scrub: 0.8 } });

    // Identificar · Fomentar · Potenciar: words rise one after another
    gsap.from(q('.ac-verbs .ac-verb > span'), { yPercent: 115, duration: 0.9, ease: 'power3.out', stagger: 0.18, scrollTrigger: { trigger: q('.ac-verbs')[0], start: 'top 80%', once: true } });

    // College video zooms out slightly as it scrolls in

    // ---- Qué te ofrecemos: pinned sideways scene (desktop) / simple reveals (phones) ----
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const sec = q('.ac-offers')[0];
      const track = q('.ac-of-track')[0];
      const panels = q('.ac-of-panel');
      const stopsEl = q('.ac-of-stop');
      const ballEl = q('.ac-of-ball')[0];
      const fillEl = q('.ac-of-fill')[0];
      const countEl = q('.ac-of-count b')[0];
      const n = panels.length;
      const parts = (p) => p.querySelectorAll('.ac-of-title, .ac-of-rule, .ac-of-desc');
      let active = 0;

      // first panel: comes in as the section arrives
      gsap.from([...parts(panels[0]), q('.ac-of-viz')[0]], {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: sec, start: 'top 65%', once: true },
      });

      // where the track is, 0 → n-1, drives the ball, the rail fill, the counter and the active panel.
      // Runs on every frame of the (smoothed) scrub, so the rail never lags behind the panels.
      const syncRail = () => {
        const pos = -gsap.getProperty(track, 'x') / window.innerWidth;
        const f = Math.min(1, Math.max(0, pos / (n - 1)));
        ballEl.style.left = `${f * 100}%`;
        fillEl.style.transform = `scaleX(${f})`;
        const i = Math.min(n - 1, Math.max(0, Math.round(pos)));
        if (i !== active) {
          active = i;
          panels.forEach((p, j) => p.classList.toggle('on', j === i));
          stopsEl.forEach((st, j) => st.classList.toggle('on', j <= i));
          countEl.textContent = `0${i + 1}`;
          setOffer(i);
        }
      };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: syncRail,
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => '+=' + window.innerHeight * 3.4,
          pin: q('.ac-of-pin')[0], scrub: 0.7, invalidateOnRefresh: true, onRefresh: syncRail,
        },
      });
      tl.to({}, { duration: 0.25 });                     // a moment to read the first offer
      for (let i = 1; i < n; i++) {
        const at = `move${i}`;
        tl.addLabel(at)
          .to(track, { x: () => -i * window.innerWidth, duration: 1, ease: 'power1.inOut' }, at)
          // outgoing number drifts away faster than its panel; incoming one arrives from further right
          .to(panels[i - 1].querySelector('.ac-of-big'), { xPercent: -60, duration: 1 }, at)
          .from(panels[i].querySelector('.ac-of-big'), { xPercent: 60, duration: 1 }, at)
          .from(parts(panels[i]), { x: 140, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out' }, `${at}+=0.35`)
          .to({}, { duration: 0.45 });                    // hold so each offer can be read
      }
      return () => { panels.forEach((p, j) => p.classList.toggle('on', j === 0)); };
    });
    mm.add('(max-width: 760px)', () => {
      q('.ac-of-panel').forEach((p) => {
        p.classList.add('on');
        gsap.from(p.querySelectorAll('.ac-of-media, .ac-of-title, .ac-of-rule, .ac-of-desc'), {
          y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: p, start: 'top 80%', once: true },
        });
      });
    });

    // ---- Para quién: the age ruler fills 8 → 18 ----
    const ticks = q('.ac-tick');
    gsap.fromTo(q('.ac-ruler-fill'), { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: q('.ac-ruler')[0], start: 'top 85%', end: 'top 45%', scrub: 0.6,
        onUpdate: (st) => ticks.forEach((t, i) => t.classList.toggle('on', st.progress >= i / (ticks.length - 1) - 0.001)) },
    });

    // CTA portrait: soft parallax
    gsap.fromTo(q('.ac-cta-media'), { yPercent: 8 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: q('.ac-cta')[0], start: 'top bottom', end: 'bottom top', scrub: true } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    return () => { mm.revert(); stopSmooth(); stopReveal(); };
  }, { scope: root, dependencies: [] });

  return (
    <div ref={root} className="ac">
      {/* Fixed top bar (after the hero) */}
      <header className="ac-bar">
        <a className="ac-back" {...linkTo('home')} aria-label="Volver a R&O Golf Range">
          <span aria-hidden="true">←</span>
          <img src="/img/logo.jpg" alt="" width="36" height="36" />
          <span className="ac-bar-name">Academia Omar Peralta</span>
        </a>
        <nav className="ac-bar-nav" aria-label="Secciones">
          <a href="#ensena" onClick={jump('ensena')}>Enseñanza</a>
          <a href="#college" onClick={jump('college')}>College Placement</a>
        </nav>
        <a className="btn gold ac-bar-cta" href={WA_LINK} target="_blank" rel="noopener noreferrer"><WaIcon />Conversá con Omar</a>
      </header>

      <main id="ac">
        {/* ============ HERO ============ */}
        <section className="ac-hero vs green">
          <div className="ac-hero-ghost" aria-hidden="true">Academia · Academia · Academia</div>
          <div className="ac-top">
            <a className="ac-back" {...linkTo('home')}>
              <span aria-hidden="true">←</span>
              <img src="/img/logo.jpg" alt="" width="44" height="44" />
              <span>Volver al range</span>
            </a>
          </div>
          <div className="ac-wrap ac-hero-grid">
            <div className="ac-hero-copy">
              <p className="label ac-kicker">R&amp;O Golf Range · Mar del Plata</p>
              <h1 className="ac-hero-title" aria-label="Academia Omar Peralta">
                <span className="ac-line"><Chars text="Academia" /></span>
                <span className="ac-line gold-text"><Chars text="Omar Peralta" /></span>
              </h1>
              <div className="rule ac-rule-grow" />
              <p className="body-l ac-hero-lead">
                Golf para todos los niveles, con un profesional PGA que conoce el camino.
                Y para los más jóvenes, un programa que puede llevarlos a una <b>universidad en el exterior</b>.
              </p>
              <ol className="ac-hero-index">
                <li><a href="#ensena" onClick={jump('ensena')}><span>01</span>Programa de enseñanza</a></li>
                <li><a href="#college" onClick={jump('college')}><span>02</span>College Placement</a></li>
              </ol>
            </div>
            <Media m={MEDIA.hero} className="ac-hero-media ac-leaf" />
          </div>
          <div className="ac-cue" aria-hidden="true"><span>Deslizá</span><i /></div>
        </section>

        {/* ============ PROGRAMA DE ENSEÑANZA ============ */}
        <section id="ensena" className="ac-ensena vs cream">
          <div className="ac-wrap">
            <header className="ac-head" data-reveal>
              <h2 className="ac-h2">Programa de enseñanza</h2>
              <p className="body-l">Cuatro capítulos: del primer grip a la planificación de un torneo.</p>
            </header>

            <div className="ac-chapters">
              <aside className="ac-sticky" aria-hidden="true">
                <div className="ac-stack ac-viz-plain">
                  <div className="ac-stack-item ac-stack-viz on">
                    <ParticleShape tone="green" shape={CHAPTER_SHAPES[CHAPTERS[chapter].key]} />
                  </div>
                </div>
                <div className="ac-sticky-meta">
                  <span className="ac-progress"><i /></span>
                  <span className="ac-sticky-n">0{chapter + 1}<small> / 0{CHAPTERS.length}</small></span>
                  <span className="ac-sticky-name">{CHAPTERS[chapter].name}</span>
                </div>
              </aside>

              <div className="ac-ch-list">
                {CHAPTERS.map((c, i) => (
                  <article key={c.key} className={`ac-ch-block${i === chapter ? ' on' : ''}`}>
                    <div className="ac-ch-media ac-viz-frame ac-viz-plain"><ParticleShape tone="green" shape={CHAPTER_SHAPES[c.key]} /></div>
                    <div className="ac-ch-head" data-reveal>
                      <span className="leaf">0{i + 1}</span>
                      <div>
                        <h3 className="ac-h3">{c.name}</h3>
                        <p className="ac-ch-kicker">{c.kicker}</p>
                      </div>
                    </div>
                    <ul className="ac-items">
                      {c.items.map((t, j) => (
                        <li key={t} data-reveal style={{ '--d': `${j * 0.08}s` }}>
                          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="7" r="5" /><path d="M8 12.5l1 6h2l1-6" /></svg>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ QUOTE ============ */}
        <section className="ac-quote vs green">
          <div className="ac-quote-bg" aria-hidden="true"><span>Invertir en uno mismo · Invertir en uno mismo · Invertir en uno mismo ·</span></div>
          <div className="ac-wrap">
            <ScrollHighlight as="blockquote" className="ac-quote-text"
              text="Jugar al Golf es Invertir en uno mismo, en el desarrollo de valores y habilidades que serán la base para afrontar el futuro con fortaleza, respeto y sabiduría." />
          </div>
        </section>

        {/* ============ COLLEGE PLACEMENT ============ */}
        <section id="college" className="ac-college vs green">
          <div className="ac-wrap">
            <header className="ac-head" data-reveal>
              <h2 className="ac-h2">Un programa de desarrollo de talento con destinos universitarios internacionales</h2>
            </header>

            {/* the journey, drawn as a golf shot */}
            <div className="ac-fp" aria-hidden="true">
              <svg viewBox="0 0 1000 260" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="acGold" x1="0" x2="1"><stop offset="0" stopColor="#c9aa60" /><stop offset=".5" stopColor="#f1e49b" /><stop offset="1" stopColor="#c9aa60" /></linearGradient>
                </defs>
                <path className="ac-fp-guide" d="M40 210 Q500 -110 960 210" />
                <path className="ac-fp-path" d="M40 210 Q500 -110 960 210" />
                <line className="ac-fp-ground" x1="0" y1="232" x2="1000" y2="232" />
                {/* tee */}
                <path className="ac-fp-tee" d="M33 218h14l-5 6v8h-4v-8z" />
                {/* flag on the far green */}
                <path className="ac-fp-flag" d="M960 232V150l34 12-34 12" />
                <circle className="ac-fp-ball" cx="40" cy="210" r="9" />
              </svg>
              <span className="ac-fp-stop" data-at="0" style={{ left: '4%', top: '92%' }}><b>Escuela</b>Estudiantes de 8 a 18 años</span>
              <span className="ac-fp-stop up" data-at="0.5" style={{ left: '50%', top: '19%' }}><b>Academia</b>Técnica, competencia y estudios</span>
              <span className="ac-fp-stop" data-at="1" style={{ left: '96%', top: '92%' }}><b>Universidad</b>Beca en el exterior</span>
            </div>

            <div className="ac-college-split">
              <div className="ac-college-copy" data-reveal>
                <p className="body-l"><b>ACADEMIA OMAR PERALTA</b> abre sus puertas a los estudiantes de escuelas que sueñan con llevar su pasión por el golf al siguiente nivel: <span className="ac-hl">obtener una beca universitaria internacional</span>, combinando la excelencia académica con la deportiva.</p>
              </div>
              <div className="ac-college-media ac-college-viz" data-reveal>
                <ParticleShape cycle={['globe', 'cap']} label="Un globo terráqueo que se transforma en un birrete de graduación" />
              </div>
            </div>

            <div className="ac-verbs" aria-label="Identificar, fomentar y potenciar el talento joven">
              {['Identificar', 'Fomentar', 'Potenciar'].map((v) => (
                <span key={v} className="ac-verb" aria-hidden="true"><span>{v}</span></span>
              ))}
            </div>
            <div className="ac-college-more" data-reveal>
              <p>Nuestra academia es un espacio donde se desarrollan <b>la técnica, la estrategia, la preparación física y mental, y la planificación competitiva</b>.</p>
              <p>Nos enfocamos en identificar, fomentar y potenciar el talento joven, bajo una mentalidad de alto rendimiento y con proyección internacional.</p>
            </div>
          </div>
        </section>

        {/* ============ QUÉ TE OFRECEMOS ============ */}
        {/* Desktop: the section pins and the four offers slide in sideways, one full screen each, while a ball
            rolls along the 4-stop rail at the bottom. Phones / reduced motion: the panels simply stack. */}
        <section className="ac-offers vs cream">
          <div className="ac-of-pin">
            <header className="ac-of-head">
              <div>
                <p className="label">El programa</p>
                <h2 className="ac-h2">Qué te ofrecemos</h2>
              </div>
              <p className="ac-of-count" aria-hidden="true"><b>01</b> / 0{OFFERS.length}</p>
            </header>

            <div className="ac-of-stage">
            <ol className="ac-of-track">
              {OFFERS.map((o, i) => (
                <li key={o.t} className={`ac-of-panel${i === 0 ? ' on' : ''}`}>
                  <span className="ac-of-big" aria-hidden="true">0{i + 1}</span>
                  <div className="ac-of-copy">
                    <h3 className="ac-of-title">{o.t}{o.s && <span className="ac-of-chip">{o.s}</span>}</h3>
                    <span className="rule ac-of-rule" />
                    <p className="ac-of-desc">{o.d}</p>
                  </div>
                  <div className="ac-of-media ac-viz-frame ac-viz-plain"><ParticleShape tone="green" shape={OFFER_SHAPES[i]} /></div>
                </li>
              ))}
            </ol>
            <div className="ac-of-viz ac-viz-frame ac-viz-plain" aria-hidden="true"><ParticleShape tone="green" shape={OFFER_SHAPES[offer]} /></div>
            </div>

            <div className="ac-of-rail" aria-hidden="true">
              <div className="ac-of-line"><i className="ac-of-fill" /></div>
              {OFFERS.map((o, i) => (
                <span key={o.stop} className={`ac-of-stop${i === 0 ? ' on' : ''}`} style={{ left: `${(i / (OFFERS.length - 1)) * 100}%` }}>
                  <i /><b>{o.stop}</b>
                </span>
              ))}
              <span className="ac-of-ball" />
            </div>
          </div>
        </section>

        {/* ============ PARA QUIÉN ============ */}
        <section className="ac-who vs green">
          <div className="ac-wrap">
            <header className="ac-head center" data-reveal>
              <p className="label">Para quién</p>
              <h2 className="ac-age"><span className="gold-text">8 – 18</span> años</h2>
              <p className="sr-only">Para estudiantes de entre 8 y 18 años.</p>
            </header>
            <div className="ac-ruler" aria-hidden="true">
              <div className="ac-ruler-line"><i className="ac-ruler-fill" /></div>
              <div className="ac-ticks">
                {AGES.map((a) => <span key={a} className={`ac-tick${a % 2 === 0 ? ' major' : ''}`}><b>{a}</b></span>)}
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="ac-cta vs cream">
          <div className="ac-wrap ac-cta-grid">
            <Media m={MEDIA.cta} className="ac-cta-media ac-leaf" />
            <div className="ac-cta-copy" data-reveal>
              <p className="label">Becas universitarias por golf</p>
              <h2 className="ac-h2">Informate sobre tu carrera de Golf</h2>
              <p className="body-l">Escribile por WhatsApp y empezá a planificar el camino.</p>
              <div className="btns">
                <a className="btn academia ac-cta-btn" href={WA_LINK} target="_blank" rel="noopener noreferrer"><WaIcon />Conversá con Omar</a>
                <a className="ac-link" {...linkTo('home')}>← Volver al range</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
