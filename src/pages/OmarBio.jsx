import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { startSmoothScroll } from '../smoothScroll.js';
import { setupReveal } from '../reveal.js';
import { linkTo } from '../route.js';
import Footer from '../sections/Footer.jsx';
import './omarbio.css';

/*
  "Acerca de Omar": Omar's biography as a newspaper edition (text from the Figma bio pages, node 2588:1339).
  Desktop: the edition is laid out at a fixed design height (820 px) and scaled to the screen; scrolling down
  slides it sideways, page by page. Phones / reduced motion: the same pages stack as a normal article.

  PHOTOS: export these layers from the Figma frame and drop them in public/img/figma/ with these names.
  A missing file shows a striped placeholder that names it.
*/
const PH = {
  young:     { src: '/img/omar-joven.jpg', layer: '(foto restaurada)', alt: 'Omar Peralta de joven, terminando un swing' },
  academiaHoy: { src: '/img/academia-hoy.jpg', layer: '(foto del dueño)', alt: 'Edificio de la Academia Omar Peralta con el logo de R&O Golf Range' },
  tour:      { src: '/img/figma/omar-tour.jpg', layer: 'IMG_7569', alt: 'Omar Peralta y Fabrizio Zanotti de espaldas, mirando el skyline de Madrid desde el campo' },
  muthaiga:  { src: '/img/omar-muthaiga.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta en el putting green del Muthaiga Golf Club, Nairobi' },
  masters:   { src: '/img/masters.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta con gorras de The Masters 2022 en Augusta National' },
  straka:    { src: '/img/omar-straka.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta y Sepp Straka junto al trofeo' },
  argentinos:{ src: '/img/omar-argentinos.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta con Rafa Echenique, Nelson Ledesma y Fabián Gómez en una cancha' },
  daly:      { src: '/img/omar-daly.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta y John Daly en el putting green' },
  celli:     { src: '/img/omar-celli.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta, con la libreta de yardas, junto a Filippo Celli en el tee' },
  trevino:   { src: '/img/omar-trevino.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta y Lee Trevino en un torneo' },
  mickelson: { src: '/img/omar-mickelson.jpg', layer: '(foto del dueño)', alt: 'Omar Peralta y Phil Mickelson en un green de práctica' },
  laguna:    { src: '/img/figma/laguna.jpg', layer: '603688_10152426…_n', alt: 'Felipe Aguilar y Omar Peralta con el trofeo en Singapur' },
  bmw:       { src: '/img/figma/omar-bmw.jpg', layer: 'IMG_4717', alt: 'Fabrizio Zanotti y Omar Peralta en Wentworth' },
  olympics:  { src: '/img/figma/olympics.jpg', layer: '1587134220471 1', alt: 'Tee de salida con los aros olímpicos' },
};

const PLAYERS = [
  ['Ángel Cabrera', 'Argentina', ''],
  ['Fabián Gómez', 'Argentina', ''],
  ['Emiliano Grillo', 'Argentina', ''],
  ['Felipe Aguilar', 'Chile', 'Campeones en Singapur'],
  ['Fabrizio Zanotti', 'Paraguay', ''],
  ['Sepp Straka', 'Austria', ''],
  ['MJ Daffue', 'Sudáfrica', 'Del Korn Ferry Tour al PGA Tour'],
  ['Álvaro Quirós', 'España', ''],
  ['Gonzalo Fernández Castaño', 'España', ''],
  ['Pablo Larrazábal', 'España', ''],
  ['Alejandro Cañizares', 'España', ''],
  ['Pablo Martín', 'España', 'Coach · 3 veces ganador del European Tour'],
  ['Filippo Celli', 'Italia', 'De la Q School al DP World Tour'],
  ['Renato Paratore', 'Italia', ''],
];

// Tour logos for the "+20 años" stat, in white circles (same badges as the Omar section on the home page).
// A w × h box fits a circle of diameter d when w² + h² ≤ d²; aspect = the trimmed logo's width / height.
const TOURS = [['/img/logos/pga-tour.svg', 'PGA Tour', 0.78], ['/img/logos/dp-world-tour.png', 'DP World Tour', 1]];
function fitInCircle(aspect) {
  const h = 100 / Math.hypot(1, aspect);
  return { width: `${(h * aspect * 0.94).toFixed(1)}%`, height: 'auto' };
}

const PAGES = ['Portada', 'Los orígenes', 'El camino', 'Junto a los grandes', 'La presión', 'Escenarios Recientes', 'Hoy'];
const DESIGN_H = 820;

function Photo({ p, caption, className = '' }) {
  const [missing, setMissing] = useState(false);
  return (
    <figure className={`ob-photo ${className}${missing ? ' ob-missing' : ''}`}>
      <div className="ob-photo-frame">
        <img src={p.src} alt={p.alt} loading="lazy" onError={() => setMissing(true)} />
        <span className="ob-photo-missing">Foto pendiente<br />Figma: {p.layer}<br />public/{p.src}</span>
      </div>
      {caption && <figcaption className="ob-cap">{caption}</figcaption>}
    </figure>
  );
}

// Running head along the top of each page, between two rules that draw in when the page arrives
const RunningHead = ({ n }) => (
  <header className="ob-rh" aria-hidden="true">
    <span>R&amp;O Golf Range · Edición Biografía</span>
    <span>{PAGES[n - 1]}</span>
    <span>Pág. 0{n}</span>
  </header>
);

const Section = ({ num, title }) => (
  <div className="ob-sec ob-fx">
    <span className="ob-sec-n">{num}</span>
    <h2 className="ob-h2">{title}</h2>
    <span className="ob-hr" />
  </div>
);

export default function OmarBio() {
  const root = useRef(null);

  useGSAP(() => {
    window.scrollTo(0, 0);
    const stopSmooth = startSmoothScroll();
    const stopReveal = setupReveal(root.current);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    // Desktop: horizontal edition. (The same media query switches the CSS layout in omarbio.css.)
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = q('.ob-stage')[0];
      const mover = q('.ob-mover')[0];
      const track = q('.ob-track')[0];
      const pages = q('.ob-page');
      const folioN = q('.ob-folio-n')[0];
      const folioName = q('.ob-folio-name')[0];
      const bar = q('.ob-folio-bar i')[0];
      let s = 1;

      // scale the 820 px design to the room between the top bar and the folio strip
      const fit = () => {
        const room = stage.clientHeight - parseFloat(getComputedStyle(stage).paddingTop) - parseFloat(getComputedStyle(stage).paddingBottom);
        s = gsap.utils.clamp(0.55, 1.4, room / DESIGN_H);
        track.style.setProperty('--s', s);
        mover.style.width = `${track.offsetWidth * s}px`;
      };
      const dist = () => Math.max(0, mover.offsetWidth + mover.offsetLeft * 2 - window.innerWidth);
      fit();
      ScrollTrigger.addEventListener('refreshInit', fit);

      let current = -1;
      const sync = () => {
        const x = -gsap.getProperty(mover, 'x');
        const vw = window.innerWidth;
        let cur = 0;
        pages.forEach((p, i) => {
          const left = mover.offsetLeft + p.offsetLeft * s - x;
          if (left < vw * 0.85) p.classList.add('in');
          if (left <= vw * 0.45) cur = i;
        });
        const max = dist();
        bar.style.transform = `scaleX(${max ? x / max : 0})`;
        if (cur !== current) {
          current = cur;
          folioN.textContent = `0${cur + 1}`;
          folioName.textContent = PAGES[cur];
        }
      };

      gsap.to(mover, {
        x: () => -dist(),
        ease: 'none',
        onUpdate: sync,
        scrollTrigger: {
          trigger: stage, start: 'top top', end: () => `+=${dist()}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true, onRefresh: sync,
        },
      });
      sync();

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', fit);
        mover.style.width = '';
        track.style.removeProperty('--s');
      };
    });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    return () => { mm.revert(); stopSmooth(); stopReveal(); };
  }, { scope: root, dependencies: [] });

  return (
    <div ref={root} className="ob">
      <header className="ob-bar">
        <a className="ob-back" {...linkTo('home')}>
          <span aria-hidden="true">←</span>
          <img src="/img/logo.jpg" alt="" width="34" height="34" />
          <span className="ob-back-txt">Volver al range</span>
        </a>
        <a className="btn academia ob-bar-cta" {...linkTo('academia')}>Academia →</a>
      </header>

      <main className="ob-stage">
        <div className="ob-mover">
          <div className="ob-track">

            {/* ===== 1 · PORTADA ===== */}
            <article className="ob-page ob-p1 in" data-reveal>
              <RunningHead n={1} />
              <div className="ob-mast ob-fx">
                <h1 className="ob-h1">Omar Peralta</h1>
                <img className="ob-pga" src="/img/figma/pga.png" alt="Profesionales de Golf de Argentina (PGA)" width="120" height="120" />
              </div>
              <div className="ob-dek ob-fx" style={{ '--d': '.1s' }}>
                <p className="ob-dek-title">PGA Argentina</p>
                <p className="ob-dek-roles">Jugador profesional · Caddie · Profesor · Coach Assistant</p>
              </div>
              <div className="ob-cols ob-p1-cols">
                <p className="ob-lead ob-fx ob-col" style={{ '--d': '.2s' }}>
                  <span className="ob-drop">A</span>ntonio Omar Peralta, es sinónimo de Pasión por el Golf. Un jugador profesional con total versatilidad para jugar, ser Caddie, Profesor, Coach Assistant, y perfeccionar a otros jugadores de alto rendimiento. Experiencia y conocimiento, son los rasgos esenciales de quien supo andar el camino del Golf durante toda su vida.
                </p>
                <p className="ob-body ob-fx ob-col" style={{ '--d': '.3s' }}>
                  Nacido en Buenos Aires el 7 de Diciembre de 1971, inmerso en este deporte desde su temprana edad, representa hoy la <b>ACADEMIA OMAR PERALTA</b>, que está dirigida a golfistas de todos los niveles, amateurs, principiantes, niños o adultos.
                </p>
              </div>
              <dl className="ob-stats ob-fx" style={{ '--d': '.4s' }}>
                <div><dt>+35</dt><dd>años como Profesional de Golf</dd></div>
                <div>
                  <dt>
                    +20
                    <span className="ob-badges">
                      {TOURS.map(([src, alt, aspect], i) => (
                        <span key={src} className="ob-badge" style={{ '--i': i }}>
                          <img src={src} alt={alt} style={fitInCircle(aspect)} />
                        </span>
                      ))}
                    </span>
                  </dt>
                  <dd>años en el PGA Tour y el DP World Tour</dd>
                </div>
                <div><dt>4</dt><dd>continentes recorridos</dd></div>
              </dl>
              <p className="ob-hint" aria-hidden="true">Deslizá para leer <span>→</span></p>
            </article>

            {/* ===== 2 · LOS ORÍGENES ===== */}
            <article className="ob-page ob-p2" data-reveal>
              <RunningHead n={2} />
              <div className="ob-split">
                <Photo p={PH.young} className="ob-p2-photo" />
                <div className="ob-split-text">
                  <Section num="I" title="Los orígenes" />
                  <div className="ob-cols">
                    <p className="ob-body ob-col ob-fx" style={{ '--d': '.15s' }}>
                      <span className="ob-drop">S</span>u experiencia se nutre desde su infancia. Su padre, Antonio Peralta fue Presidente de la Asociación Argentina de Profesionales Golf (AAPG) durante casi 2 décadas, y le transmitió todo su conocimiento, ya sea entrenándolo para su carrera profesional, como brindándole todos los atributos que las vertientes del Golf le demandarían.
                    </p>
                    <div className="ob-col">
                      <blockquote className="ob-pull ob-fx" style={{ '--d': '.3s' }}>
                        <p>“Me transmitió todo su conocimiento.”</p>
                        <cite>Sobre su padre, Antonio Peralta · Presidente de la AAPG durante casi 2 décadas</cite>
                      </blockquote>
                      <p className="ob-body ob-fx ob-p2-more" style={{ '--d': '.45s' }}>
                        Ya de chico se destacaba entre los golfistas de su edad por sus condiciones deportivas sobresalientes, y antes de convertirse en profesional hizo un gran recorrido en las competencias.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* ===== 3 · EL CAMINO ===== */}
            <article className="ob-page ob-p3" data-reveal>
              <RunningHead n={3} />
              <div className="ob-split rev">
                <div className="ob-split-text">
                  <Section num="II" title="El camino" />
                  <p className="ob-body ob-fx ob-p3-text" style={{ '--d': '.15s' }}>
                    <span className="ob-drop">H</span>a recorrido todo el mundo enriqueciendo su camino de carrera en cada destino y cancha de Golf conocida. Asia, Europa, África y América comprenden todos los países visitados.
                  </p>
                  <ul className="ob-continents" aria-hidden="true">
                    {['Asia', 'Europa', 'África', 'América'].map((c, i) => (
                      <li key={c} className="ob-fx" style={{ '--d': `${0.25 + i * 0.1}s` }}>{c}</li>
                    ))}
                  </ul>
                  <p className="ob-note ob-fx" style={{ '--d': '.7s' }}>Cientos de campos de juego caminados.</p>
                </div>
                <Photo p={PH.muthaiga} className="ob-p3-photo ob-p3-muthaiga" caption="Omar Peralta en el Muthaiga Golf Club, Nairobi, Kenia." />
                <Photo p={PH.tour} className="ob-p3-photo ob-p3-madrid" caption="Omar Peralta y Fabrizio Zanotti en el Club de Campo Villa de Madrid." />
              </div>
            </article>

            {/* ===== 4 · JUNTO A LOS GRANDES ===== */}
            <article className="ob-page ob-p4" data-reveal>
              <RunningHead n={4} />
              <div className="ob-p4-grid">
                <div className="ob-p4-side">
                  <Section num="III" title="Junto a los grandes" />
                  <p className="ob-body ob-fx" style={{ '--d': '.15s' }}>
                    Omar ha podido trabajar y ser parte de la carrera profesional de grandes jugadores.
                  </p>
                  <Photo p={PH.mickelson} className="ob-p4-photo" caption="Omar Peralta y Phil Mickelson." />
                </div>
                <div className="ob-p4-table ob-fx" style={{ '--d': '.2s' }}>
                  <table className="ob-table">
                    <thead><tr><th>Jugador</th><th>País</th><th>Nota</th></tr></thead>
                    <tbody>
                      {PLAYERS.map(([n, c, note]) => (
                        <tr key={n}><td>{n}</td><td>{c}</td><td>{note}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="ob-note">…entre otros.</p>
                </div>
                <Photo p={PH.argentinos} className="ob-p4-group" caption="Omar Peralta con Rafa Echenique, Nelson Ledesma y Fabián Gómez." />
                <Photo p={PH.straka} className="ob-p4-straka" caption="Omar Peralta y Sepp Straka." />
                <Photo p={PH.daly} className="ob-p4-straka ob-p4-daly" caption="Omar Peralta y John Daly en el putting green." />
              </div>
            </article>

            {/* ===== 5 · LA PRESIÓN ===== quote page between the players and the big stages */}
            <article className="ob-page ob-pq" data-reveal>
              <RunningHead n={5} />
              <div className="ob-split rev">
                <div className="ob-pq-text">
                  <p className="ob-pq-kicker ob-fx">Entre jugador y caddie</p>
                  <blockquote className="ob-pq-quote ob-fx" style={{ '--d': '.15s' }}>
                    <span className="ob-pq-mark" aria-hidden="true">“</span>
                    <p>La presión es jugar por cinco dólares el hoyo cuando solo tienes dos en el bolsillo.</p>
                    <cite>Lee Trevino</cite>
                  </blockquote>
                  <span className="ob-hr" />
                  <p className="ob-lead ob-fx ob-pq-body" style={{ '--d': '.35s' }}>
                    Omar sabe bien lo que es la presión del juego, y tiene mucho para contar sobre la relación entre jugador y caddie.
                  </p>
                </div>
                <Photo p={PH.trevino} className="ob-pq-photo" caption="Omar Peralta y Lee Trevino." />
                <Photo p={PH.celli} className="ob-pq-photo ob-pq-celli" caption="Omar Peralta y Filippo Celli en el DP World Tour." />
              </div>
            </article>

            {/* ===== 6 · ESCENARIOS RECIENTES ===== */}
            <article className="ob-page ob-p5" data-reveal>
              <RunningHead n={6} />
              <Section num="IV" title="Escenarios Recientes" />
              <ol className="ob-timeline">
                <li className="ob-fx" style={{ '--d': '.2s' }}>
                  <p className="ob-year">2014</p>
                  <p className="ob-place">Singapur</p>
                  <Photo p={PH.laguna} className="ob-ph-laguna" caption="Felipe Aguilar (Chile) y Omar Peralta, campeones del The Championship at Laguna National, en Singapur en 2014." />
                </li>
                <li className="ob-fx" style={{ '--d': '.25s' }}>
                  <p className="ob-year">2022</p>
                  <p className="ob-place">Augusta, EEUU</p>
                  <Photo p={PH.masters} caption="The Masters, Augusta National, EEUU." />
                </li>
                <li className="ob-fx" style={{ '--d': '.3s' }}>
                  <p className="ob-year">2024</p>
                  <p className="ob-place">Surrey, Inglaterra</p>
                  <Photo p={PH.bmw} className="ob-ph-bmw" caption="Fabrizio Zanotti y Omar Peralta en el BMW PGA Championship 2024, Wentworth Club, Surrey, Inglaterra." />
                </li>
                <li className="ob-fx" style={{ '--d': '.4s' }}>
                  <p className="ob-year">2024</p>
                  <p className="ob-place">París, Francia</p>
                  <Photo p={PH.olympics} />
                  <p className="ob-body">En 2024, tuvo la gran oportunidad de compartir con delegaciones del mundo los Juegos Olímpicos que tuvieron lugar en París, Francia, trabajando con Fabrizio Zanotti (Paraguay) en la sede “Le Golf National, Saint-Quentin-en-Yvelines”.</p>
                </li>
              </ol>
            </article>

            {/* ===== 7 · HOY ===== (today's swing, answering the young one in "Los orígenes") */}
            <article className="ob-page ob-p6" data-reveal>
              <RunningHead n={7} />
              <div className="ob-split rev">
                <div className="ob-split-text">
                  <Section num="V" title="Hoy" />
                  <p className="ob-lead ob-fx" style={{ '--d': '.15s' }}>
                    <span className="ob-drop">S</span>u trayectoria le aporta lo fundamental para que su Academia sea un espacio de práctica de primer nivel, con el mejor asesoramiento en la Federación Regional de Golf Mar y Sierras.
                  </p>
                  <p className="ob-body ob-fx ob-p6-next" style={{ '--d': '.25s' }}>
                    Después de recorrer el mundo junto a los mejores jugadores del mundo, Omar eligió volver a casa con todo lo aprendido. Hoy su desafío es devolverle al golf argentino esa experiencia: formar jugadores con una mirada internacional desde Mar del Plata.
                  </p>
                  <div className="ob-end ob-fx" style={{ '--d': '.3s' }}>
                    <span className="ob-hr" />
                    <div className="ob-cta">
                      <a className="btn academia" {...linkTo('academia')}>Conocé la Academia →</a>
                      <a className="ob-link" {...linkTo('home')}>← Volver al range</a>
                    </div>
                    <p className="ob-fin" aria-hidden="true">■</p>
                  </div>
                </div>
                <Photo p={PH.academiaHoy} className="ob-p6-photo" caption="La Academia Omar Peralta, en R&amp;O Golf Range, Mar del Plata." />
              </div>
            </article>

          </div>
        </div>

        {/* folio strip under the edition: current page + progress (desktop only) */}
        <div className="ob-folio" aria-hidden="true">
          <span>Pág. <b className="ob-folio-n">01</b> / 0{PAGES.length}</span>
          <span className="ob-folio-bar"><i /></span>
          <span className="ob-folio-name">{PAGES[0]}</span>
        </div>
      </main>
      <Footer />
    </div>
  );
}
