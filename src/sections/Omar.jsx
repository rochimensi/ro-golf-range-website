import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AutoplayVideo from '../components/AutoplayVideo.jsx';

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
    logos: [['img/logos/pga-argentina.png', 'PGA Argentina', 0.75]],
  },
  {
    n: 20,
    sr: 'Más de 20 años como Coach Assistant y Caddie en el PGA Tour y el DP World Tour.',
    caption: 'años como Coach Assistant y Caddie en el PGA Tour y el DP World Tour',
    logos: [['img/logos/pga-tour.svg', 'PGA Tour', 0.78], ['img/logos/dp-world-tour.png', 'DP World Tour', 1]],
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
              <AutoplayVideo src={`video/${name}.mp4`} poster={`video/${name}.jpg`} preload="auto" aria-hidden="true" />
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
            {/* TODO: point at the full biography once it has its own screen (see OmarStory below) */}
            <div className="btns">
              <a className="btn academia" href="#acerca-de-omar">Acerca de Omar →</a>
            </div>
          </header>
        </div>
      </div>
    </section>
  );
}

/*
  Full biography, saved for a separate screen about Omar.

  function OmarStory() {
    return (
      <section id="omar" className="vs green omar" data-sec={100}>
        <div className="wrap">
          <div className="gold-frame">
            <div className="omar-top" data-reveal>
              <div>
                <h2 className="omar-name">Omar Peralta</h2>
                <p className="omar-pga">PGA Argentina</p>
              </div>
              <figure className="pga-badge">
                <img src="img/figma/pga.png" alt="Profesionales de Golf de Argentina (PGA)" loading="lazy" data-fallback />
                <figcaption className="missing-note">PGA</figcaption>
              </figure>
            </div>
            <div className="omar-intro" data-reveal>
              <p><strong>Antonio Omar Peralta</strong>, es sinónimo de Pasión por el Golf. Un jugador profesional con total versatilidad para jugar, ser Caddie, Profesor, Coach Assistant, y perfeccionar a otros jugadores de alto rendimiento. Experiencia y conocimiento, son los rasgos esenciales de quien supo andar el camino del Golf durante toda su vida.</p>
              <p>Nacido en Buenos Aires el 7 de Diciembre de 1971, inmerso en este deporte desde su temprana edad, representa hoy la ACADEMIA OMAR PERALTA, que está dirigida a golfistas de todos los niveles, amateurs, principiantes, niños o adultos.</p>
            </div>
            <div className="omar-row">
              <div className="omar-col" data-reveal>
                <p>Su experiencia se nutre desde su infancia. Su padre, Antonio Peralta fue Presidente de la Asociación Argentina de Profesionales Golf (AAPG) durante casi 2 décadas, y le transmitió todo su conocimiento, ya sea entrenándolo para su carrera profesional, como brindándole todos los atributos que las vertientes del Golf le demandarían.</p>
                <p>Ha recorrido todo el mundo enriqueciendo su camino de carrera en cada destino y cancha de Golf conocida. Asia, Europa, África y América comprenden todos los países visitados con cientos de campos de juego caminados.</p>
                <p>Sus ya 34 años como Profesional de Golf, y más de 20 años de trabajo como Coach Assistant y Caddie en el PGA Tour y European Tour (hoy llamado DP World Tour), le aportan lo fundamental para que su Academia sea un espacio de práctica de primer nivel, con el mejor asesoramiento y atención al público en la Federación Regional de Golf Mar y Sierras.</p>
              </div>
              <figure className="omar-photo bleed" data-reveal>
                <img src="img/figma/omar-swing.jpg" alt="Omar Peralta en pleno swing" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/omar-swing.jpg</figcaption>
              </figure>
            </div>
            <div className="omar-players">
              <figure className="omar-photo tall" data-reveal>
                <img src="img/figma/omar-tour.jpg" alt="Omar Peralta trabajando como caddie en el DP World Tour" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/omar-tour.jpg</figcaption>
              </figure>
              <div className="players-card" data-reveal>
                <p>Omar ha podido trabajar y ser parte de la carrera profesional de grandes jugadores. Destacamos de Argentina a <b>Ángel Cabrera, Fabián Gomez</b> y <b>Emiliano Grillo</b>, a <b>Felipe Aguilar</b> de Chile (siendo campeones en Singapur), a <b>Fabrizio Zanotti</b> de Paraguay, a <b>Sepp Straka</b> de Austria, a <b>MJ Daffue</b> de Sudáfrica (a quién le ayudó a pegar el salto del Korn Ferry Tour al PGA Tour), a los Españoles <b>Álvaro Quiros</b>, <b>Gonzalo Fernandez Castaño</b>, <b>Pablo Larrazábal</b>, <b>Alejandro Cañizares</b>, <b>Pablo Martín</b> (coach, 3 veces ganador del European Tour), a <b>Filippo Celli</b> (llevándolo de la Q School al circuito DP World Tour) y <b>Renato Paratore</b> de Italia, entre otros de Estados Unidos del PGA Tour.</p>
              </div>
              <figure className="omar-photo small" data-reveal>
                <img src="img/figma/omar-links.jpg" alt="Omar Peralta en un campo de links" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/omar-links.jpg</figcaption>
              </figure>
            </div>
            <div className="omar-events">
              <div className="ev" data-reveal>
                <div className="rule" />
                <p>En 2024, tuvo la gran oportunidad de compartir con delegaciones del mundo los Juegos Olímpicos que tuvieron lugar en París, Francia, trabajando con Fabrizio Zanotti (Paraguay) en la sede “Le Golf National, Saint-Quentin-en-Yvelines”.</p>
              </div>
              <figure className="omar-photo wide" data-reveal>
                <img src="img/figma/olympics.jpg" alt="Tee de salida con los aros olímpicos" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/olympics.jpg</figcaption>
              </figure>
              <figure className="omar-photo square" data-reveal>
                <img src="img/figma/worldcup.jpg" alt="Trofeo de la ISPS Handa World Cup of Golf" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/worldcup.jpg</figcaption>
              </figure>
              <div className="ev" data-reveal>
                <div className="rule" />
                <p>También participó en dos World Golf Cups, en 2011 en China, la Copa “Omega Mission Hills”, y en 2013 en Australia, la Copa “ISPS Handa”.</p>
              </div>
              <figure className="omar-photo captioned" data-reveal>
                <img src="img/figma/omar-bmw.jpg" alt="Fabrizio Zanotti y Omar Peralta en el BMW PGA Championship 2024" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/omar-bmw.jpg</figcaption>
                <figcaption className="cap-cream">Fabrizio Zanotti y Omar Peralta en el BMW PGA Championship 2024, Wentworth Club, Surrey, Inglaterra.</figcaption>
              </figure>
              <figure className="omar-photo captioned" data-reveal>
                <img src="img/figma/laguna.jpg" alt="Felipe Aguilar y Omar Peralta con el trofeo en Singapur" loading="lazy" data-fallback />
                <figcaption className="missing-note">Foto pendiente · img/figma/laguna.jpg</figcaption>
                <figcaption className="cap-cream">Felipe Aguilar (Chile) y Omar Peralta, campeones del The Championship at Laguna National, en Singapur en 2014.</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>
    );
  }
*/
