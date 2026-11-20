import { useCallback, useEffect, useRef, useState } from 'react';
import { pauseScroll } from '../smoothScroll.js';

// Photos only: aspect ratio = width / height.
const ITEMS = [
  { src: '/img/g01.webp', alt: 'Baldes listos para practicar', ar: 0.75 },
  { src: '/img/g03.webp', alt: 'Un café entre baldes', ar: 0.75 },
  { src: '/img/g05.jpg', alt: 'Lavandas junto al range', ar: 0.75 },
  { src: '/img/g06.jpg', alt: 'Entrenamiento con ayudas', ar: 0.455 },
  { src: '/img/g07.webp', alt: 'Atardecer en las bahías', ar: 0.75 },
  { src: '/img/g09.jpg', alt: 'Ejercicios en el césped', ar: 0.8 },
  { src: '/img/g11.webp', alt: 'Flores en las bahías', ar: 0.75 },
  { src: '/img/g13.webp', alt: 'Grupo de golfistas en el range', ar: 0.5625 },
  { src: '/img/g14.webp', alt: 'Clase con los más chicos', ar: 0.75 },
  { src: '/img/g15.webp', alt: 'Gatera interior con vista al range', ar: 0.8 },
  { src: '/img/g16.webp', alt: 'Una tarde de práctica bajo las bahías techadas', ar: 0.75 },
  { src: '/img/g17.webp', alt: 'Atardecer sobre las gateras', ar: 1.7778 },
  { src: '/img/g18.webp', alt: 'Clínica de chicos en el range', ar: 0.6442 },
  { src: '/img/g19.webp', alt: 'Malvones bajo el techo de las gateras', ar: 0.5625 },
];
const FX = ['up', 'left', 'split', 'drop'];

// One tile. The file is only requested when the tile comes within about half a screen of view, and the
// tile is revealed (its clip-path wipe, see .ph[data-fx]) once it is both on screen and fully loaded, so
// an empty frame never wipes in.
function Photo({ item, fx, delay, onOpen }) {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const load = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSrc(item.src); load.disconnect(); }
    }, { rootMargin: '0px 0px 50% 0px' });
    const view = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); view.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    load.observe(el);
    view.observe(el);
    return () => { load.disconnect(); view.disconnect(); };
  }, [item.src]);

  return (
    <button ref={ref} className={`ph${seen && loaded ? ' in' : ''}`} data-fx={fx}
            style={{ '--ar': item.ar, transitionDelay: `${delay}ms` }}
            aria-label={`Ver foto: ${item.alt}`} onClick={onOpen}>
      {src && (
        <img src={src} alt={item.alt} decoding="async" draggable="false" onLoad={() => setLoaded(true)}
             style={item.pos ? { objectPosition: item.pos } : undefined} />
      )}
    </button>
  );
}

export default function Gallery() {
  const photos = ITEMS;
  const [open, setOpen] = useState(-1);
  const show = useCallback((i) => setOpen((i + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    if (open < 0) return;
    pauseScroll(true);
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      if (e.key === 'ArrowRight') show(open + 1);
      if (e.key === 'ArrowLeft') show(open - 1);
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); pauseScroll(false); };
  }, [open, show]);

  return (
    <>
      <div className="gal">
        {ITEMS.map((it, i) => (
          // a small stagger across each row of three, so tiles revealed together don't all wipe at once
          <Photo key={it.src} item={it} fx={FX[i % FX.length]} delay={(i % 3) * 90} onOpen={() => setOpen(i)} />
        ))}
      </div>

      <div id="lb" className={open >= 0 ? 'open' : ''} role="dialog" aria-modal="true" aria-label="Galería" aria-hidden={open < 0}
           onClick={(e) => { if (e.target === e.currentTarget) setOpen(-1); }}
           onTouchStart={(e) => { e.currentTarget.dataset.tx = e.touches[0].clientX; }}
           onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - Number(e.currentTarget.dataset.tx); if (Math.abs(dx) > 40) show(open + (dx < 0 ? 1 : -1)); }}>
        <button className="lb-btn lb-close" aria-label="Cerrar" onClick={() => setOpen(-1)}>✕</button>
        <button className="lb-btn lb-prev" aria-label="Foto anterior" onClick={() => show(open - 1)}>←</button>
        {open >= 0 && <img key={open} src={photos[open].src} alt={photos[open].alt} />}
        <div className="lb-cap"><span className="label lb-count">{open >= 0 ? `${open + 1} / ${photos.length}` : ''}</span></div>
        <button className="lb-btn lb-next" aria-label="Foto siguiente" onClick={() => show(open + 1)}>→</button>
      </div>
    </>
  );
}
