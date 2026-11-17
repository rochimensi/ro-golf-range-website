import { useCallback, useEffect, useState } from 'react';
import { pauseScroll } from '../smoothScroll.js';

// Photos: aspect ratio = width / height. Videos are 9:16 slots: drop the files in public/video/ to fill them.
const ITEMS = [
  { src: 'img/g01.jpg', alt: 'Baldes listos para practicar', ar: 0.75 },
  { src: 'img/g02.jpg', alt: 'Bahías techadas', ar: 0.75 },
  { video: 'video/v01.mp4', alt: 'Video del range' },
  { src: 'img/g03.jpg', alt: 'Un café entre baldes', ar: 0.75 },
  { src: 'img/g04.jpg', alt: 'Tarde de práctica en el range', ar: 0.75 },
  { src: 'img/g05.jpg', alt: 'Lavandas junto al range', ar: 0.75 },
  { src: 'img/g06.jpg', alt: 'Entrenamiento con ayudas', ar: 0.455 },
  { video: 'video/v02.mp4', alt: 'Video del range' },
  { src: 'img/g07.jpg', alt: 'Atardecer en las bahías', ar: 0.75 },
  { src: 'img/g08.jpg', alt: 'Práctica en las bahías', ar: 0.75 },
  { src: 'img/g09.jpg', alt: 'Ejercicios en el césped', ar: 0.8 },
  { src: 'img/g10.jpg', alt: 'Un rincón entre los pinos', ar: 0.5625 },
  { video: 'video/v03.mp4', alt: 'Video del range' },
  { src: 'img/g11.jpg', alt: 'Flores en las bahías', ar: 0.75 },
  { src: 'img/g12.jpg', alt: 'Estacionamiento privado', ar: 0.62, pos: '50% 72%' },
];
const FX = ['up', 'iris', 'left', 'split', 'drop'];

function VideoTile({ item, fx }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`ph video${missing ? ' missing' : ''}`} style={{ '--ar': 9 / 16 }} data-fx={fx}>
      {!missing && (
        <video src={item.video} muted loop playsInline autoPlay preload="metadata" aria-label={item.alt}
               onError={() => setMissing(true)} />
      )}
      {missing && <span className="play" aria-hidden="true">▶</span>}
      <span className="missing-note">Video 9:16 · próximamente</span>
    </div>
  );
}

export default function Gallery() {
  const photos = ITEMS.filter((it) => it.src);
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

  let pi = -1;
  return (
    <>
      <div className="gal">
        {ITEMS.map((it, i) => {
          const fx = FX[i % FX.length];
          if (it.video) return <VideoTile key={i} item={it} fx={fx} />;
          pi += 1;
          const idx = pi;
          return (
            <button key={i} className="ph" style={{ '--ar': it.ar }} data-fx={fx} aria-label={`Ver foto: ${it.alt}`} onClick={() => setOpen(idx)}>
              <img src={it.src} alt={it.alt} loading="lazy" decoding="async" draggable="false" style={it.pos ? { objectPosition: it.pos } : undefined} />
            </button>
          );
        })}
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
