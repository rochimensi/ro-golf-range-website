import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { createPuttScene } from '../putt/scene.js';
import { scrollToTarget } from '../smoothScroll.js';
import { STACKED } from '../layout.js';

// How long the putt lasts, in screen-heights of scroll. Two big, quick scrolls reach the pin.
// (3.5 for the four-panel path: hero, access + bays, comfort, holed.)
const SCREENS = 3.5;

// Each glyph reels through these digits, in a random order, then lands on the real character.
const SPIN_DIGITS = ['5', '1', '0', '2', '3', '7'];
const SPIN_LINES = ['Acceso', 'sin cargo'];

function makeReel(char) {
  const spins = 7 + Math.floor(Math.random() * 4);
  const reel = [];
  let prev = -1;
  for (let i = 0; i < spins; i++) {
    let idx = Math.floor(Math.random() * SPIN_DIGITS.length);
    if (idx === prev) idx = (idx + 1) % SPIN_DIGITS.length;
    prev = idx;
    reel.push(SPIN_DIGITS[idx]);
  }
  reel.push(char);
  return reel;
}

// Hero headline pieces: each letter (or word) in its own inline-block so it can move on its own.
const splitChars = (text) => [...text].map((ch, i) => (ch === ' ' ? ' ' : <span className="ch" key={i}>{ch}</span>));
const splitWords = (text, className = '') => text.split(' ').flatMap((w, i) => [
  i ? ' ' : null,
  <span className={`w ${className}`.trim()} key={i}>{w}</span>,
]);

function SpinHeading() {
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const reels = useMemo(
    () => SPIN_LINES.map((line) => [...line].map((ch) => (ch === ' ' ? null : makeReel(ch)))),
    [],
  );
  if (reduce) {
    return <h2 className="big"><span className="spin-line">Acceso</span><span className="spin-line">sin cargo</span></h2>;
  }
  return (
    <h2 className="big spin-head" aria-label="Acceso sin cargo">
      {SPIN_LINES.map((line, li) => (
        <span className="spin-line" key={line} aria-hidden="true">
          {[...line].map((ch, i) => (
            ch === ' ' ? (
              <span className="spin-space" key={i} />
            ) : (
              <span className="slot" key={i}>
                <span className="slot-sizer">{ch}</span>
                <span className="slot-reel">
                  {reels[li][i].map((glyph, j) => <span key={j}>{glyph}</span>)}
                </span>
              </span>
            )
          ))}
        </span>
      ))}
    </h2>
  );
}

export default function PuttIntro() {
  const stage = useRef(null);

  useGSAP(() => {
    const el = stage.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = createPuttScene({
      canvas: el.querySelector('canvas'),
      stage: el,
      track: el.querySelector('#track'),
      chip: el.querySelector('#chip'),
      hint: el.querySelector('#hint'),
      cta: el.querySelector('#cta'),
      ruler: el.querySelector('#ruler'),
      scrollScreens: SCREENS,
    });

    // GSAP pins the stage and scrubs a 0→1 progress value; scrub smoothing gives the ball its glide.
    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => '+=' + window.innerHeight * SCREENS,
        pin: true,
        scrub: reduce ? true : 1.4,
        invalidateOnRefresh: true,
        onRefreshInit: () => scene.resize(),
      },
    });

    // Headline: as large as the space right of the putter allows (the longest line fills the width,
    // capped by screen height), then each line rises out of its mask one after another.
    const title = el.querySelector('.hero-title');
    const fitTitle = () => {
      const text = el.querySelector('.hero-text');
      const setSize = (px) => {
        title.style.fontSize = `${px}px`;
        // the Academia block below sizes its type from the headline's size
        text.style.setProperty('--title-size', title.style.fontSize);
        // the rule, tagline and scroll prompt line up with the right edge of the longest line
        const w = Math.max(...[...title.querySelectorAll('.hl > span')].map((n) => n.offsetWidth));   // layout width: ignores the intro transforms
        el.querySelector('.hero-sub').style.width = `${Math.ceil(w)}px`;
      };
      title.style.fontSize = '100px';
      const widest = Math.max(...[...title.querySelectorAll('.hl > span')].map((n) => n.scrollWidth));
      const avail = title.parentElement.clientWidth;
      const size = Math.min((avail / widest) * 100, window.innerHeight * 0.17);
      let px = Math.max(32, Math.floor(size));
      setSize(px);
      // Phones: the scroll prompt moves below the ball (72% down the screen, see putt/scene.js) to leave
      // more room for the headings, and the rest of the text stack has to end above the putter head, so on
      // short screens step the headline (and with it the Academia block) down until it does.
      const hint = text.querySelector('.hint');
      if (window.matchMedia(STACKED).matches) {
        Object.assign(hint.style, { position: 'absolute', right: '0', top: `${Math.round(window.innerHeight * 0.72 + 30 - text.offsetTop)}px` });
        const limit = window.innerHeight * 0.72 - 70;   // clears the putter head too
        while (px > 24 && text.offsetTop + text.offsetHeight > limit) setSize(px -= 2);
      } else {
        Object.assign(hint.style, { position: '', right: '', top: '' });
      }
    };
    fitTitle();
    if (document.fonts) document.fonts.ready.then(fitTitle);
    ScrollTrigger.addEventListener('refreshInit', fitTitle);

    let stopHead = () => {};
    if (!reduce) {
      // Headline, one treatment per line:
      //   "El nuevo"      each letter drops into its slot, one after another, in a steady rhythm
      //   "driving de"    the whole line pops in, zooming up from small with a little overshoot
      //   "Mar del Plata" each word rises from its mask, its letters moving together
      const dropChars = title.querySelectorAll('.hl-drop .ch');
      const popLine = title.querySelector('.hl-pop > span');
      const words = title.querySelectorAll('.hl-words .w');
      gsap.set(dropChars, { yPercent: -120 });
      gsap.set(popLine, { scale: 0, autoAlpha: 0 });
      gsap.set(words, { yPercent: 110 });
      // The headline starts the moment the page loads and lands completely in 2 s (HEAD); the logo turns
      // and fades in alongside it. Line timings are fractions of HEAD so the whole thing scales together:
      //   letters 0 → 41%, pop 32 → 60%, words 52 → 100%
      const HEAD = 2, LOGO = 1.4;
      const at = (f) => f * HEAD;
      const dropStagger = (at(0.41) - at(0.225)) / Math.max(1, dropChars.length - 1);
      const wordStagger = at(0.2) / Math.max(1, words.length - 1);
      const tl = gsap.timeline({ paused: true });
      tl.from(el.querySelector('.logo-badge'), { autoAlpha: 0, scale: 0.9, rotation: -8, duration: LOGO, ease: 'power2.out' }, 0)
        .to(dropChars, { yPercent: 0, duration: at(0.225), ease: 'bounce.out', stagger: dropStagger }, 0)
        .to(popLine, { scale: 1, autoAlpha: 1, duration: at(0.275), ease: 'back.out(2.2)' }, at(0.325))
        .to(words, { yPercent: 0, duration: at(0.275), ease: 'power4.out', stagger: wordStagger }, at(0.525));
      tl.from(el.querySelectorAll('.hero-after'), { autoAlpha: 0, y: 16, duration: 0.6, ease: 'power2.out', stagger: 0.1 }, '-=0.2');
      // Play on the intro's own clock from the very first frame: each frame advances it at most 1/30 s,
      // so a busy moment while the page loads (the putt scene building its textures) pauses the headline
      // for an instant instead of skipping part of it. (The page turns off GSAP's own lag smoothing.)
      const advance = (time, deltaMs) => {
        tl.time(tl.time() + Math.min(deltaMs, 1000 / 30) / 1000);
        if (tl.progress() === 1) gsap.ticker.remove(advance);
      };
      gsap.ticker.add(advance);
      stopHead = () => gsap.ticker.remove(advance);
      // the scroll prompt shows straight away, so it's there even if the visitor scrolls before the headline lands
      // (the inner span animates in; the scene fades the outer #hint out once scrolling starts)
      gsap.from(el.querySelector('.hint-in'), { autoAlpha: 0, y: 10, duration: 0.5, ease: 'power2.out', delay: 0.35 });
    }

    // "Acceso / sin cargo": each glyph spins through random digits once the card is on screen.
    let stopSpin = () => {};
    const spinHead = el.querySelector('.spin-head');
    if (!reduce && spinHead) {
      const reels = [...spinHead.querySelectorAll('.slot-reel')];
      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        reels.forEach((reel) => {
          const cells = reel.children;
          const end = cells[cells.length - 1].offsetTop;
          const prev = cells[Math.max(0, cells.length - 2)].offsetTop;
          const ticks = Math.max(1, cells.length - 2);
          // Whole digits tick past, then the real character eases into place.
          gsap.timeline({ delay: Math.random() * 0.08 })
            .to(reel, { y: -prev, duration: ticks * 0.048, ease: `steps(${ticks})` })
            .to(reel, { y: -end, duration: 0.14, ease: 'power2.out' });
        });
      };
      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          io.disconnect();
        }
      }, { threshold: 0.55 });
      io.observe(spinHead);
      stopSpin = () => io.disconnect();
    }

    // Board cards reveal like the hero's Academia block (fade in while rising 16px, one after another) as their
    // panel slides in: once it's half on screen. They reset when you scroll back before it, so they replay.
    const boards = [...el.querySelectorAll('.board:not(.cta)')];   // the closing panel is shown by the scene instead
    const markStacked = () => boards.forEach((b) => { b.dataset.stacked = getComputedStyle(b).position === 'absolute' ? '0' : '1'; });
    markStacked();
    window.addEventListener('resize', markStacked);
    const reveal = (camX) => {
      const W = el.clientWidth;
      boards.forEach((b) => {
        const left = b.parentElement.offsetLeft - camX;   // panel's left edge on screen
        // phones (stacked, left-aligned content): wait until the panel is mostly in, so the entrance plays where
        // you can see it (starting earlier, it finished while the content was still off the right edge)
        const at = b.dataset.stacked === '1' ? 0.3 : 0.5;
        if (left < W * at) b.classList.add('in');
        else if (left > W * 0.95) b.classList.remove('in');
      });
    };
    const tick = () => reveal(scene.render(state.p, performance.now()));
    gsap.ticker.add(tick);
    return () => { stopHead(); stopSpin(); gsap.ticker.remove(tick); window.removeEventListener('resize', markStacked); ScrollTrigger.removeEventListener('refreshInit', fitTitle); };
  }, { scope: stage });

  const goDown = () => scrollToTarget('#canastos');
  const replay = () => scrollToTarget(0, { immediate: true });

  return (
    <div id="stage" ref={stage}>
      <canvas aria-hidden="true" />
      <div id="track">
              <section className="sec hero-sec">
            <div className="hero">
              <h1 className="sr-only">R&amp;O Golf Range · Driving range y Academia de Golf Omar Peralta en Mar del Plata · Los Acantilados</h1>
              <div className="logo-badge"><img className="logo" src="/img/logo.jpg" alt="R&O Golf Range · Los Acantilados" width={640} height={641} /></div>
              <div className="hero-text">
                <h2 className="display-xl hero-title" aria-label="El nuevo driving de Mar del Plata">
                  {/* line 1 drops in letter by letter, line 2 pops in whole, line 3 rises word by word */}
                  <span className="hl hl-drop" aria-hidden="true"><span>{splitChars('El nuevo')}</span></span>
                  <span className="hl hl-pop" aria-hidden="true"><span>driving de</span></span>
                  <span className="hl hl-words" aria-hidden="true"><span>{splitWords('Mar del Plata', 'gold-text')}</span></span>
                </h2>
                <div className="hero-sub">
                  <div className="rule hero-after" />
                  <p className="body-l hero-after">Tu espacio de golf, relajación y entrenamiento.</p>
                  <p className="hero-academia hero-after">
                    <span className="ha-intro">Junto a la</span>{' '}
                    <span className="ha-name">Academia</span>{' '}
                    <span className="ha-name ha-big">Omar Peralta</span>
                  </p>
                  <div className="hint label" id="hint"><span className="hint-in">Deslizá para embocar el putt <span className="arrow">→</span></span></div>
                </div>
              </div>
            </div>
          </section>
          {/* Panel 1 (Figma 3211:2): free access + the practice bays. Laid out on a 1440×900 board that scales with the screen. */}
          <section className="sec board-sec">
            <div className="board">
              {/* No card: big type straight on the grass (Academia style: cream line + gold line), copy on the right */}
              <div className="feature b-acceso" style={{ '--d': 0 }}>
                <div>
                  <SpinHeading />
                </div>
                <ul className="feat-list">
                  <li><div><span className="txt">No necesitás ser socio del club para practicar.</span></div></li>
                  <li><div><span className="txt">La entrada al range es libre y gratuita.</span></div></li>
                </ul>
              </div>
              {/* Two features side by side, no cards (canvas option C): cream/gold word + outlined gold line, short rule, copy */}
              <div className="ftype b-techada" style={{ '--d': 1 }}>
                <h2 aria-label="Práctica techada y descubierta"><span aria-hidden="true">Techado</span><span className="ol" aria-hidden="true">y descubierto</span></h2>
                <p>Práctica con sol, viento o lluvia. ¡Que nada te detenga!</p>
              </div>
              <div className="ftype b-cesped" style={{ '--d': 2 }}>
                <h2><span className="gold-text">Césped</span><span className="ol">y alfombras</span></h2>
                <p>Césped natural y alfombras Real Feel Country Club Elite: las más realistas del mercado profesional.</p>
              </div>
            </div>
          </section>
          {/* Panel 2 (Figma 3212:2): comfort services + club rental */}
          <section className="sec board-sec">
            <div className="board">
              {/* Services as a list of big words on the grass (canvas option C): outline / cream / gold, copy beside each */}
              <ul className="svc-list">
                <li className="svc svc-1" style={{ '--d': 0 }}>
                  <h3 className="ol">Starlink</h3>
                  <p>Trabajo remoto: conectate para trabajar y entrenar.</p>
                </li>
                <li className="svc svc-2" style={{ '--d': 1 }}>
                  <h3>Cafetería</h3>
                  <p>Algo rico para acompañar la práctica.</p>
                </li>
                <li className="svc svc-3" style={{ '--d': 2 }}>
                  <h3 className="gold-text">Parking</h3>
                  <p><b>Estacionamiento privado.</b> Ya no hay que caminar hacia el Driving Range dentro del Club.</p>
                </li>
              </ul>
              {/* No card (canvas option C): intro, gold rule, "Alquiler de" cream, giant gold PALOS, outlined line */}
              <div className="b-alquiler" style={{ '--d': 3 }}>
                <p className="al-intro">¿Estás viajando ligero? Vení a practicar igual.</p>
                <span className="rule" aria-hidden="true" />
                <h2>
                  <span className="al-name">Alquiler de</span>{' '}
                  <span className="al-name al-big gold-text">palos</span>{' '}
                  <span className="al-name al-ol">y training aids</span>
                </h2>
              </div>
            </div>
          </section>
          {/* Closing panel (Figma 3215:2): shows while the ball rolls its last 4 yards; "Puttear de nuevo" sits beside the cup */}
          <section className="sec board-sec end-sec">
            <div className="board cta" id="cta">
              <h2 className="end-title" style={{ '--d': 0 }}>Abierto todo el año</h2>
              <img className="end-badge" src="/img/club-mar-del-plata.png" alt="Club Mar del Plata" width={121} height={120} style={{ '--d': 1 }} />
              <p className="end-text" style={{ '--d': 1 }}>De lunes a lunes<br />En el Club Mar del Plata, Golf Los Acantilados.</p>
              <button className="primary end-more" id="go-down" onClick={goDown} style={{ '--d': 2 }}>Más información abajo ↓</button>
              <button className="end-replay" id="replay" onClick={replay} style={{ '--d': 3 }}>Puttear de nuevo</button>
            </div>
          </section>
        
      </div>

      <div id="ruler" aria-hidden="true">
        <div className="r-line" /><div className="r-fill" />
        <div className="r-ticks" />
        <svg className="r-flag" viewBox="0 0 14 20"><path d="M2 20V1" stroke="#fbf4e6" strokeWidth="1.4" strokeDasharray="2.2 2.2" /><path d="M2.6 1.2 12.5 4.2 2.6 7.2Z" fill="#fbf4e6" /></svg>
        <div className="r-ball" />
      </div>
      <div id="chip" className="label">Putt de 20 yardas</div>
    </div>
  );
}
