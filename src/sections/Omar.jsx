import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AutoplayVideo from '../components/AutoplayVideo.jsx';
import { linkTo } from '../route.js';

// Video cover, same as Canastos: three clips at staggered heights with the big heading over them.
const CLIPS = ['omar_1', 'omar_2', 'omar_3'];

// Largest box with the logo's own shape (width / height) that fits inside the circle, less a small margin:
// a w × h box fits a circle of diameter d when w² + h² ≤ d². Logo files are trimmed to their visible edges.
const FIT = 0.94;
function fitInCircle(aspect) {
  const h = 100 / Math.hypot(1, aspect);
  return { width: `${(h * aspect * FIT).toFixed(1)}%`, height: 'auto' };
}

const STATS = [
  {
    n: 35,
    sr: 'Más de 35 años como profesional de golf (PGA Argentina).',
    caption: 'años como profesional de golf',
    logos: [['/img/logos/pga-argentina.png', 'PGA Argentina', 0.75]],
  },
  {
    n: 20,
    sr: 'Más de 20 años como Coach Assistant y Caddie en el PGA Tour y el DP World Tour.',
    caption: 'años como Coach Assistant y Caddie en el PGA Tour y el DP World Tour',
    logos: [['/img/logos/pga-tour.svg', 'PGA Tour', 0.78], ['/img/logos/dp-world-tour.png', 'DP World Tour', 1]],
  },
];

export default function Omar() {
  const root = useRef(null);

  // Count up 0 → n once, when the stats scroll into view (they show the final numbers until then,
  // and for visitors with reduced motion).
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.utils.toArray('.omar-stat-count').forEach((el, i) => {
      const to = Number(el.dataset.to);
      const v = { n: 0 };
      el.textContent = '0+';
      gsap.to(v, {
        n: to,
        duration: 1.8,
        delay: i * 0.2,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = `${Math.round(v.n)}+`; },
        scrollTrigger: { trigger: '.omar-stats', start: 'top 80%', once: true },
      });
    });
  }, { scope: root });

  return (
    <section id="omar" ref={root} className="vs green omar has-cover" data-sec={100}>
      <div className="cv">
        <div className="cv-grid">
          {CLIPS.map((name) => (
            <div key={name} className={`cv-tile cv-${name}`}>
              <AutoplayVideo src={`/video/${name}.mp4`} poster={`/video/${name}.jpg`} preload="auto" aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="cv-shade" aria-hidden="true" />
        <h2 className="cv-title">Omar Peralta</h2>
      </div>
      <div className="wrap">
        <div className="omar-brief">
          <header className="vh" data-reveal>
            <h3 className="display-l">Director de la academia</h3>
            <p className="omar-lead">Omar es sinónimo de Pasión por el Golf. Un jugador profesional con total versatilidad para jugar, ser Caddie, Profesor, Coach Assistant, y perfeccionar a otros jugadores de alto rendimiento. Experiencia y conocimiento, son los rasgos esenciales de quien supo andar el camino del Golf durante toda su vida.</p>
            {/* The sentence as two stats: each number counts up when it scrolls into view, with its logos in
                white circles tucked into the number's top corner. */}
            <div className="omar-stats">
              {STATS.map(({ n, sr, caption, logos }) => (
                <div key={n} className="omar-stat">
                  <p className="sr-only">{sr}</p>
                  <div className="omar-stat-fig" aria-hidden="true">
                    <span className="omar-stat-num">
                      <span className="omar-stat-sizer">{n}+</span>
                      <span className="omar-stat-count" data-to={n}>{n}+</span>
                    </span>
                    <span className="omar-stat-logos">
                      {logos.map(([src, alt, aspect]) => (
                        <span key={src} className="omar-logo">
                          <img src={src} alt={alt} style={fitInCircle(aspect)} loading="lazy" />
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="omar-stat-cap" aria-hidden="true">{caption}</p>
                </div>
              ))}
            </div>
            <div className="btns">
              <a className="btn academia" {...linkTo('omar')}>Acerca de Omar →</a>
            </div>
          </header>
        </div>
      </div>
    </section>
  );
}
