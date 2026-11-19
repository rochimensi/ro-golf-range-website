import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollHighlight from '../components/ScrollHighlight.jsx';

// Two treatments of the R&O monogram, to compare (pick one, then drop the other):
//   ?nosotros=logo   (default) the logo's emblem as a faint watermark behind the founders
//   ?nosotros=letras the founder cards carry a giant R and O, in the logo's serif and gold
const VARIANT = typeof location !== 'undefined' && new URLSearchParams(location.search).get('nosotros') === 'letras'
  ? 'letras' : 'logo';

export default function Nosotros() {
  const root = useRef(null);

  // Title: the letters of SOBRE rise out of a mask one by one, then R&O pops in, in the logo's gold.
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.timeline({ scrollTrigger: { trigger: '.nos-title', start: 'top 85%', once: true } })
      .from('.nos-title .nos-ch', { yPercent: 115, duration: 0.7, ease: 'power3.out', stagger: 0.045 })
      .from('.nos-title .nos-ro', { scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.2)' }, '-=0.35');
  }, { scope: root });

  return (
    <section id="nosotros" ref={root} className={`vs green nos-${VARIANT}`} data-sec={200}>
      <div className="wrap">
        <header className="vh center">
          <h2 className="display-xl nos-title" aria-label="Sobre R&O">
            <span className="nos-mask" aria-hidden="true">
              {[...'SOBRE'].map((ch, i) => <span key={i} className="nos-ch">{ch}</span>)}
            </span>{' '}
            <span className="nos-ro" aria-hidden="true">R&amp;O</span>
          </h2>
        </header>
        <div className="about">
        <div className="founders">
            {VARIANT === 'logo' && <img className="nos-mark" src="img/logo-mark.png" alt="" aria-hidden="true" />}
            <article className="founder" data-reveal><span className="mono" aria-hidden="true">R</span><div><h3 className="heading-3">Ing. Rosario Mensi</h3><p className="caption">Visión tecnológica · Servicio, automatizaciones y eficiencia</p></div></article>
            <article className="founder" data-reveal><span className="mono" aria-hidden="true">O</span><div><h3 className="heading-3">Omar Peralta</h3><p className="caption">Profesional de golf PGA · Coach Assistant y Caddie</p></div></article>
            <div className="since" data-reveal><b>Dic 2024</b><span className="label">EST. Los Acantilados</span></div>
          </div>
          {/* same word-by-word scroll highlight as the quote in Golf, one sweep through all four paragraphs */}
          <ScrollHighlight className="about-text" text={[
            { className: 'body-l', text: 'En R&O Golf Range somos apasionados por el golf y la innovación.' },
            { text: 'Nacimos en diciembre de 2024 dentro del Club Mar del Plata, Golf Los Acantilados, con el objetivo de transformar la práctica de este deporte en la ciudad y sus alrededores.' },
            { text: 'Detrás de este proyecto están los 2 fundadores: la Ingeniera Rosario Mensi y el profesional de golf Omar Peralta.' },
            { text: 'Desde Mar del Plata, trabajamos para posicionarnos a nivel nacional y demostrar que la evolución del golf empieza aquí.' },
          ]} />
        </div>
        <div className="mv">
          <article className="mv-card" data-reveal>
            <div className="label">Visión</div>
            <p className="body-l">Redefinir la práctica en un espacio inclusivo para mejorar y disfrutar, desde el primer golpe al perfeccionamiento.</p>
          </article>
          <article className="mv-card" data-reveal>
            <div className="label">Misión</div>
            <p className="body-l">Acercar a más personas al golf, con una experiencia moderna, accesible y de alto nivel.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
