import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AutoplayVideo from '../components/AutoplayVideo.jsx';

const STEPS = [
  { id: 'transformacion_1', title: 'Oportunidades de mejora', text: 'Así lucía el driving range de Los Acantilados anteriormente.' },
  { id: 'transformacion_2', title: 'Césped mejorado', text: 'Recuperamos el césped de todo el campo de práctica.' },
  { id: 'transformacion_3', title: 'Estacionamiento', text: 'Eliminamos la necesidad de caminar 400 metros para llegar al range.' },
  { id: 'transformacion_4', title: 'Alfombras y pelotas nuevas', text: 'Adquisición de 10 nuevas Real Feel Golf Mats Country Club Elite, las mejores del mercado profesional, y pelotas de range TaylorMade.' },
  { id: 'transformacion_5', title: 'Cafetería', text: <>Con el nuevo módulo de <a href="https://steelbox.com.ar/" target="_blank" rel="noopener noreferrer">Steel Box</a>, podemos brindar el servicio de cafetería para que la sesión de práctica sea más completa.</> },
];

// Timeline as a squared S: the gold line enters at the top left, runs right, drops down the right edge
// beside step 1, runs back left between rows, drops down the left edge beside step 2, and so on.
// The copy always sits on the line's side, the video on the other. It draws itself as you scroll,
// and each step lights up as the line reaches it. On phones it's one straight line down the left.
// Videos are lazy: none is downloaded until its step comes within about half a screen.
const OUT = 36; // how far the line runs past the first and last rows

function buildPath(tl) {
  const box = tl.getBoundingClientRect();
  const rows = [...tl.querySelectorAll('.tl-row')].map((r) => {
    const b = r.getBoundingClientRect();
    return { top: b.top - box.top, bottom: b.bottom - box.top };
  });
  const nodeR = parseFloat(getComputedStyle(tl).getPropertyValue('--node')) / 2 || 22;
  const x0 = nodeR;
  const x1 = box.width - nodeR;
  const first = rows[0].top - OUT;
  // closing item: the line ends at a node just above "Y vendrán más mejoras"
  const endEl = tl.querySelector('.tl-end').getBoundingClientRect();
  const endY = endEl.top - box.top + nodeR;
  const nodes = [];

  if (window.matchMedia('(max-width: 900px)').matches) {
    rows.forEach((r) => nodes.push([x0, r.top + nodeR]));
    nodes.push([x0, endY]);
    return { d: `M${x0},${first} V${endY}`, nodes, width: box.width, height: box.height };
  }
  let d = `M${x0},${first} H${x1}`;
  rows.forEach((r, i) => {
    const side = i % 2 === 0 ? x1 : x0;
    const other = i % 2 === 0 ? x0 : x1;
    nodes.push([side, (r.top + r.bottom) / 2]);
    if (i < rows.length - 1) {
      const gapMid = (r.bottom + rows[i + 1].top) / 2;
      d += ` V${gapMid} H${other}`;
    } else {
      // after the last step, turn in to the middle and drop to the closing node
      const cx = box.width / 2;
      d += ` V${(r.bottom + endEl.top - box.top) / 2} H${cx} V${endY}`;
      nodes.push([cx, endY]);
    }
  });
  return { d, nodes, width: box.width, height: box.height };
}

export default function Transformacion() {
  const root = useRef(null);

  useGSAP(() => {
    const tl = root.current.querySelector('.tl');
    const svg = tl.querySelector('.tl-line');
    const track = svg.querySelector('.tl-track');
    const draw = svg.querySelector('.tl-draw');
    const nodeEls = [...tl.querySelectorAll('.tl-node')];
    const progress = { p: 0 };
    let len = 0;

    const paint = () => { draw.style.strokeDashoffset = String(len * (1 - progress.p)); };
    const layout = () => {
      const { d, nodes, width, height } = buildPath(tl);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      track.setAttribute('d', d);
      draw.setAttribute('d', d);
      len = draw.getTotalLength();
      draw.style.strokeDasharray = String(len);
      nodes.forEach(([x, y], i) => { nodeEls[i].style.left = `${x}px`; nodeEls[i].style.top = `${y}px`; });
      paint();
    };
    layout();
    const ro = new ResizeObserver(() => { layout(); ScrollTrigger.refresh(); });
    ro.observe(tl);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      progress.p = 1; paint();
      tl.querySelectorAll('.tl-row, .tl-end').forEach((r) => r.classList.add('on'));
    } else {
      gsap.to(progress, {
        p: 1, ease: 'none', onUpdate: paint,
        scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 },
      });
      tl.querySelectorAll('.tl-row, .tl-end').forEach((row) => {
        ScrollTrigger.create({ trigger: row, start: 'top 70%', onEnter: () => row.classList.add('on') });
      });
    }
    return () => ro.disconnect();
  }, { scope: root });

  return (
    <section id="transformacion" ref={root} className="vs cream" data-sec={200}>
      <header className="vh tf-head" data-reveal>
        <div className="label">Nuestro primer año</div>
        <h2 className="display-l">La transformación del lugar</h2>
        <p className="body-l">Así cambiamos el driving range del Golf Los Acantilados desde Diciembre de 2024.</p>
      </header>
      <div className="wrap">
        <div className="tl">
          <svg className="tl-line" aria-hidden="true" preserveAspectRatio="none">
            <path className="tl-track" />
            <path className="tl-draw" />
          </svg>
          <ol className="tl-rows">
            {STEPS.map(({ id, title, text }, i) => (
              <li key={id} className={`tl-row${i % 2 ? ' rev' : ''}`}>
                <span className="tl-node" aria-hidden="true"></span>
                <figure className="tl-media">
                  <AutoplayVideo lazy src={`video/${id}.mp4`} poster={`video/${id}.jpg`} aria-label={title} />
                </figure>
                <div className="tl-copy">
                  <span className="tl-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="tl-title">{title}</h3>
                  <p className="body-l">{text}</p>
                </div>
              </li>
            ))}
            <li className="tl-end">
              <span className="tl-node tl-node-end" aria-hidden="true"></span>
              <p className="tl-end-title">Y vendrán más</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
