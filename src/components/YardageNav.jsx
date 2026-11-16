import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Range yardage signs on the left: each one marks a group of sections. The ball travels between
// the signs as you scroll; the current sign lights up gold. Click a sign to jump there.
const SIGNS = [
  { yd: 30, id: 'canastos', label: 'Canastos' },
  { yd: 50, id: 'clases', label: 'Clases' },
  { yd: 100, id: 'omar', label: 'Omar Peralta' },
  { yd: 150, id: 'empresas', label: 'Empresas' },
  { yd: 200, id: 'galeria', label: 'Galería' },
  { yd: 250, id: 'nosotros', label: 'Nosotros' },
  { yd: 300, id: 'contacto', label: 'Contacto' },
];

export default function YardageNav() {
  const nav = useRef(null);

  useGSAP(() => {
    const el = nav.current;
    const links = [...el.querySelectorAll('a')];
    const ball = el.querySelector('.yd-ball');
    const centerOf = (a) => a.offsetTop + a.offsetHeight / 2 - 4;

    // show the rail as soon as the putt section unpins and vertical scrolling begins
    ScrollTrigger.create({
      trigger: document.getElementById('v'), start: 'top bottom', end: 'bottom top',
      onToggle: (st) => el.classList.toggle('on', st.isActive),
      onRefresh: (st) => el.classList.toggle('on', st.isActive),
    });

    SIGNS.forEach((s, i) => {
      // (query the document directly: useGSAP's scope would limit selector strings to the nav)
      const groupSecs = [...document.querySelectorAll(`#v [data-sec="${s.yd}"]`)];
      if (!groupSecs.length) return;
      ScrollTrigger.create({
        trigger: groupSecs[0],
        endTrigger: groupSecs[groupSecs.length - 1],
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (st) => {
          if (!st.isActive) return;
          links.forEach((a, j) => { a.classList.toggle('active', j === i); a.classList.toggle('passed', j < i); });
        },
        onUpdate: (st) => {
          const from = centerOf(links[i]);
          const to = links[i + 1] ? centerOf(links[i + 1]) : from;
          ball.style.top = `${from + (to - from) * st.progress - ball.parentElement.offsetTop}px`;
        },
      });
    });
  }, { scope: nav });

  return (
    <nav id="yardage" ref={nav} aria-label="Secciones del sitio">
      <div className="yd-track" aria-hidden="true"><span className="yd-ball" /></div>
      {SIGNS.map((s) => (
        <a key={s.yd} href={`#${s.id}`} aria-label={`${s.label} (${s.yd} yardas)`}>
          <b>{s.yd}</b><span>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
