import { useEffect, useId, useRef, useState } from 'react';

/*
  Hand-drawn line sketches that draw themselves stroke by stroke (each path's dash offset animates to 0,
  one after another). `active` turns the drawing on/off; leave it undefined and the sketch draws itself
  when it scrolls into view. Strokes: default gold, `thin` = lighter detail, `accent` = cream, `bold`.
  All drawings share a 400 × 500 viewBox.
*/

// a gear outline (teeth as trapezoids) + hub, as one path
function gear(cx, cy, r, teeth, depth) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    const p = (ang, rad) => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
    pts.push(p(a - step * 0.28, r), p(a - step * 0.16, r + depth), p(a + step * 0.16, r + depth), p(a + step * 0.28, r));
  }
  const ring = `M${pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L')} Z`;
  const h = r * 0.34;
  return `${ring} M${cx - h} ${cy} a${h} ${h} 0 1 0 ${h * 2} 0 a${h} ${h} 0 1 0 ${-h * 2} 0`;
}
const circle = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;

const SKETCHES = {
  // a golfer at the finish of the swing. The body is drawn with thick strokes that are never shown:
  // an SVG filter traces only their outer edge, so you see one clean contour of the figure.
  swing: {
    vb: '60 50 300 410',
    outlined: [
      { d: 'M190 280 L210 350 L188 414', c: 'o-leg' },                    // trail leg: knee turned in, heel up
      { d: 'M188 416 L178 430', c: 'o-foot' },
      { d: 'M212 278 L224 352 L224 426', c: 'o-leg' },                    // lead leg, planted
      { d: 'M224 428 L252 432', c: 'o-foot' },
      { d: 'M206 172 C214 206 208 242 200 276', c: 'o-torso' },           // body, a slight arch at the finish
      { d: 'M178 172 C196 160 216 158 232 164', c: 'o-shoulders' },
      { d: 'M178 172 C186 142 204 114 232 94', c: 'o-arm' },              // trail arm
      { d: 'M230 164 C248 144 250 116 236 96', c: 'o-arm' },              // lead arm
      { d: circle(208, 124, 4), c: 'o-head' },                            // head
    ],
    paths: [
      { d: 'M238 90 L124 142 L110 150' },                                 // the club, one fine line
      { d: 'M140 440 C190 436 250 436 300 440', c: 'thin' },              // ground
      { d: circle(318, 92, 5) },                                          // the ball
    ],
  },
  // a green from above: contours, the pin, two bunkers and the ball
  green: [
    { d: 'M120 170 C150 110 260 100 300 150 C340 196 330 290 280 330 C230 370 140 360 110 310 C80 262 96 210 120 170 Z' },           // the green
    { d: 'M150 190 C180 160 240 160 262 196 C282 230 262 270 222 276 C186 282 150 262 146 232 C144 214 146 200 150 190 Z', c: 'thin' },   // contours
    { d: 'M182 208 C200 192 230 194 238 214 C246 236 228 252 206 252 C186 252 174 236 182 208 Z', c: 'thin' },
    { d: 'M60 300 C40 270 60 236 86 250 C100 258 92 280 100 296 C108 316 80 330 60 300 Z' },                                          // bunkers
    { d: 'M318 96 C340 70 380 80 376 110 C372 136 340 132 330 124 C318 116 306 112 318 96 Z' },
    { d: 'M206 226 a8 5 0 1 0 16 0 a8 5 0 1 0 -16 0' },                // the hole
    { d: 'M214 226 L214 166 L248 176 L214 186' },                       // pin and flag
    { d: circle(150, 302, 5) },                                         // the ball
  ],
  // rules and etiquette: right and wrong
  rules: [
    { d: circle(112, 250, 74) },
    { d: 'M80 252 L104 278 L150 218' },
    { d: circle(290, 250, 74) },
    { d: 'M264 224 L316 276 M316 224 L264 276' },
  ],
  // a head in profile with two gears turning inside
  mind: [
    { d: 'M150 450 C152 410 146 386 132 360 C104 314 92 258 104 206 C118 144 176 100 244 100 C306 100 346 146 350 200 C352 222 350 236 356 250 L374 286 C378 292 374 298 366 298 L356 300 C360 310 356 316 350 318 C356 324 354 332 346 334 C350 350 344 366 326 372 C310 376 296 376 290 384 L292 450' },
    { d: gear(200, 214, 44, 10, 10), g: 'gear-a', o: '200px 214px' },
    { d: gear(270, 262, 26, 7, 8), g: 'gear-b', o: '270px 262px' },
  ],
};

export default function LineSketch({ name, active, className = '', label }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  const auto = active === undefined;

  useEffect(() => {
    if (!auto) return undefined;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [auto]);

  const on = auto ? seen : active;
  const sk = SKETCHES[name] || [];
  const paths = Array.isArray(sk) ? sk : sk.paths;
  const outlined = (!Array.isArray(sk) && sk.outlined) || [];
  const vb = (!Array.isArray(sk) && sk.vb) || '0 0 400 500';
  const fid = `ls-outline-${useId().replace(/:/g, '')}`;
  return (
    <div ref={ref} className={`lsketch${on ? ' on' : ''} ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox={vb} preserveAspectRatio="xMidYMid meet">
        {outlined.length > 0 && (
          <>
            <defs>
              {/* contour of the union of the thick strokes: dilate their shape, then cut the shape out */}
              <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="grown" />
                <feComposite in="grown" in2="SourceAlpha" operator="out" result="edge" />
                <feFlood className="lsketch-ink" />
                <feComposite in2="edge" operator="in" />
              </filter>
            </defs>
            <g className="lsketch-outlined" filter={`url(#${fid})`}>
              {outlined.map((p, i) => <path key={i} d={p.d} pathLength="1" className={p.c || ''} style={{ '--i': i }} />)}
            </g>
          </>
        )}
        {paths.map((p, j) => {
          const i = j + outlined.length;
          const path = <path key={i} d={p.d} pathLength="1" className={p.c || ''} style={{ '--i': i }} />;
          return p.g
            ? <g key={i} className={`lsketch-spin ${p.g}`} style={{ transformOrigin: p.o }}>{path}</g>
            : path;
        })}
      </svg>
    </div>
  );
}
