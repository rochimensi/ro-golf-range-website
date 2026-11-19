import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AutoplayVideo from '../components/AutoplayVideo.jsx';

// Scroll scene: the section pins and arrives green with a big "CLASES" heading. Columns of green drop
// away one by one, revealing the cream background; the heading turns green where the cream shows, so it
// stays readable. Once the grid is all cream, the heading drops out and the content comes in, all tied
// to the scroll, so the section only scrolls on once everything is shown.
const COLS = 16;
const TITLE = 'Clases para todos los niveles';
const COVER_WORD = 'Clases';

// The big heading, drawn in the same place in every layer (see .cl-cover).
const Cover = ({ className = '' }) => (
  <div className={`cl-cover ${className}`} aria-hidden="true">
    <span className="cl-title">
      {[...COVER_WORD].map((ch, i) => <span key={i} className="cl-letter">{ch}</span>)}
    </span>
  </div>
);

export default function Clases() {
  const root = useRef(null);

  useGSAP(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // One pinned, scroll-driven timeline: the section stays on screen until all the content is shown.
    // Timeline units ≈ screens of scroll (the pin lasts as many screens as the timeline is long).
    const ease = 'power3.out';
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    // 1. Columns drop. Each column carries a cream copy of the heading that moves the opposite way,
    //    so the copy stays still on screen and is simply uncovered.
    tl.to('.clases-col', { yPercent: 101, duration: 0.4, stagger: { amount: 0.6 } }, 0)
      .to('.clases-col-inner', { yPercent: -101, duration: 0.4, stagger: { amount: 0.6 } }, 0);

    // 2. Grid full: the heading drops away.
    tl.to('.cl-cover-ink .cl-letter', { yPercent: 110, opacity: 0, duration: 0.2, ease: 'power2.in', stagger: { amount: 0.12 } }, 1.05);

    // 3. Content comes in, quickly, and the section unpins as soon as it's all shown
    //    (no hold at the end, so there's no dead scroll before the page moves on).
    const c = 1.3;
    tl.from('.clases-word', { yPercent: 110, duration: 0.2, ease, stagger: 0.03 }, c + 0.05)
      .from('.clases .rule', { scaleX: 0, transformOrigin: 'left center', duration: 0.15, ease: 'power2.inOut' }, c + 0.15)
      .from('.clases .body-l', { y: 20, opacity: 0, duration: 0.15, ease }, c + 0.2)
      .from('.clases .levels span', { y: 12, scale: 0.85, opacity: 0, duration: 0.12, ease: 'back.out(2)', stagger: 0.04 }, c + 0.25)
      .from('.clases .btn', { opacity: 0, duration: 0.15, ease }, c + 0.35)
      // Video uncovers top to bottom, echoing the columns, while it settles from a slight zoom.
      .from('.clases .framed', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.35, ease: 'power2.inOut' }, c + 0.05)
      .from('.clases .framed video', { scale: 1.18, duration: 0.45, ease }, c + 0.05);

    ScrollTrigger.create({
      animation: tl,
      trigger: root.current,
      start: 'top top',
      // 0.85 screens of scroll per timeline unit
      end: () => `+=${tl.duration() * window.innerHeight * 0.85}`,
      pin: true,
      scrub: 0.4,
      invalidateOnRefresh: true,
    });
  }, { scope: root });

  return (
    <section id="clases" ref={root} className="vs cream clases" data-sec={50}>
      {/* green heading on the cream background, under the columns */}
      <Cover className="cl-cover-ink" />
      <div className="clases-grid" aria-hidden="true">
        {Array.from({ length: COLS }, (_, i) => (
          <span key={i} className="clases-col" style={{ '--i': i }}>
            <span className="clases-col-inner"><Cover /></span>
          </span>
        ))}
      </div>
      <div className="wrap">
        <div className="split">
          <header className="vh">
            <h2 className="display-l clases-title" aria-label={TITLE}>
              {TITLE.split(' ').map((w, i) => (
                <span key={i} className="clases-word-mask" aria-hidden="true"><span className="clases-word">{w}</span></span>
              ))}
            </h2>
            <div className="rule" />
            <div className="clases-lead">
              <p className="body-l">Desde principiantes hasta alto rendimiento. <br />Clases <strong>individuales o grupales</strong>, con Omar Peralta.</p>
              <div className="levels" aria-label="Niveles">
                <span>Principiantes</span><span>Intermedios</span><span>Avanzados</span><span>Alto rendimiento</span>
              </div>
              <p className="body-l">Se coordina el horario y la clase con reserva previa.</p>
              <a className="btn academia" href="#contacto">Quiero tomar clases</a>
            </div>
          </header>
          <figure className="framed clases-media">
            <AutoplayVideo src="video/clases.mp4" poster="video/clases.jpg" preload="metadata" aria-label="Omar Peralta dando clases en el driving" />
          </figure>
        </div>
      </div>
    </section>
  );
}
