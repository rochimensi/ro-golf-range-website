import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { createPuttScene } from '../putt/scene.js';

// How long the putt lasts, in screen-heights of scroll. Two big, quick scrolls reach the pin.
const SCREENS = 5;

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

    const tick = () => scene.render(state.p, performance.now());
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, { scope: stage });

  const goDown = () => document.getElementById('canastos').scrollIntoView({ behavior: 'smooth' });
  const replay = () => window.scrollTo({ top: 0, behavior: 'instant' });

  return (
    <div id="stage" ref={stage}>
      <canvas aria-hidden="true" />
      <div id="track">
              <section className="sec hero-sec">
            <div className="hero">
              <h1 className="sr-only">R&amp;O Golf Range · Los Acantilados</h1>
              <div className="logo-badge"><img className="logo" src="img/logo.jpg" alt="R&O Golf Range · Los Acantilados" width={640} height={641} /></div>
              <div className="hero-text">
                <h2 className="display-xl">El nuevo<br />driving de<br /><span className="gold-text">Mar del Plata</span></h2>
                <div className="rule" />
                <p className="body-l">Tu espacio de golf, relajación y entrenamiento.</p>
                <div className="hint label" id="hint">Deslizá para embocar el putt <span className="arrow">→</span></div>
              </div>
            </div>
          </section>
              <section className="sec center">
            <div className="card feature">
              <div>
                <div className="label">01 — Acceso libre</div>
                <h2 className="big">Abierto<br />a todos</h2>
                <div className="rule" />
                <p className="intro-p">El driving range está dentro del Club Mar del Plata, Golf Los Acantilados, pero <strong>no hace falta ser socio</strong>. Vení cuando quieras.</p>
              </div>
              <ul className="feat-list">
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx={9} cy={7} r={3} /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17.5" cy="8.5" r="2.5" /><path d="M15.5 14.2A5 5 0 0 1 22 19" /></svg>
                  <div><span className="label">Abierto a todo público</span><span className="txt">No necesitás ser socio del club para practicar.</span></div>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" /><path d="M14 8l5-2v15" /><path d="M3 21h18" /><path d="M11 13v1" /></svg>
                  <div><span className="label">Acceso sin cargo</span><span className="txt">La entrada al range es libre y gratuita.</span></div>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={3} width={18} height={18} rx={3} /><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" /></svg>
                  <div><span className="label">Estacionamiento privado</span><span className="txt">Dejá el auto dentro del predio del club.</span></div>
                </li>
              </ul>
            </div>
          </section>
          <section className="sec right">
            <div className="card wide">
              <div className="label">02 — Gateras de práctica</div>
              <h2 className="display-l">Elegí dónde pegar</h2>
              <div className="rule" />
              <ul className="ico-list">
                <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 10 12 4l10 6" /><path d="M5 9v11M19 9v11" /><path d="M3 20h18" /></svg><div><span className="label">Techadas y descubiertas</span><span className="txt">Practicá con sol, con viento o con lluvia.</span></div></li>
                <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18" /><path d="M5 20c0-4 1-7 2-9M9 20c0-5 .5-8 1.5-11M13 20c0-4 1-8 2.5-10M17 20c0-3 .8-6 2-8" /></svg><div><span className="label">Césped natural o alfombras Real Feel</span><span className="txt">Las alfombras más realistas del mercado.</span></div></li>
                <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><circle cx={12} cy={15} r={2} /><path d="M12 13V9" /></svg><div><span className="label">Gatera indoor</span><span className="txt">Un espacio cerrado para practicar todo el año.</span></div></li>
              </ul>
            </div>
          </section>
          <section className="sec">
            <div className="card wide">
              <div className="label">03 — Servicios</div>
              <h2 className="display-l">Quedate el día</h2>
              <div className="rule" />
              <ul className="ico-list">
                <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5a10 10 0 0 1 14 0" /><path d="M8.5 15.8a5 5 0 0 1 7 0" /><circle cx={12} cy={19} r={1} /><path d="M2 9a14.5 14.5 0 0 1 20 0" /></svg><div><span className="label">Starlink</span><span className="txt">Conexión para trabajar remoto entre baldes.</span></div></li>
                <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3" /></svg><div><span className="label">Cafetería</span><span className="txt">Algo rico para acompañar la práctica.</span></div></li>
                <li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x={7} y={9} width={10} height={12} rx={2} /><path d="M9 9V3l2 1M13 9V2.5l2 1M11 9V5" /><path d="M7 14h10" /></svg><div><span className="label">Alquiler de palos</span><span className="txt">Si no tenés equipo, te lo prestamos.</span></div></li>
              </ul>
            </div>
          </section>
          <section className="sec right">
            <div className="card pro">
              <div className="label">04 — Profesional a cargo</div>
              <h2 className="display-l">Omar Peralta</h2>
              <p className="pro-sub">Profesional de golf · PGA Argentina</p>
              <div className="rule" />
              <p>Más de 30 años como profesional, y más de 20 como Coach Assistant y Caddie en el PGA Tour y el European Tour. Te asesora desde tu primer golpe hasta el alto rendimiento.</p>
              <a className="text-link" href="#omar">Conocé a Omar ↓</a>
            </div>
          </section>
          <section className="sec center">
            <div className="card cta" id="cta">
              <div className="label">¡Embocada!</div>
              <h2 className="display-l">Abierto todo el año</h2>
              <div className="rule" />
              <p className="body-l">De lunes a lunes, en el Club Mar del Plata, Golf Los Acantilados.</p>
              <div className="btns">
                <button className="primary" id="go-down" onClick={goDown}>Seguí bajando ↓</button>
                <button className="ghost" id="replay" onClick={replay}>Patear de nuevo ↺</button>
              </div>
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
