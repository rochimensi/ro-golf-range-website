import { useEffect, useRef } from 'react';

/*
  Particles that gather into a simple golf icon and morph to the next one.
  - shape: one of the keys in SHAPES (morphs when it changes)
  - cycle: a list of keys to loop through on their own (every `interval` ms) while on screen
  Dots scatter around the pointer and settle back. Paused while off screen; visitors with reduced
  motion get the finished icon, still. Drawn on a transparent canvas: put it on a coloured frame.
*/

// Each icon is drawn white on an offscreen canvas in a unit box (-1…1, y down), then sampled into dots.
const SHAPES = {
  // golf ball: outline + dimples
  ball(c) {
    c.lineWidth = 0.07; c.beginPath(); c.arc(0, 0, 0.8, 0, Math.PI * 2); c.stroke();
    c.save(); c.beginPath(); c.arc(0, 0, 0.68, 0, Math.PI * 2); c.clip();
    for (let y = -0.66, row = 0; y <= 0.66; y += 0.19, row++) {
      for (let x = -0.66 + (row % 2) * 0.095; x <= 0.66; x += 0.19) { c.beginPath(); c.arc(x, y, 0.045, 0, Math.PI * 2); c.fill(); }
    }
    c.restore();
  },
  // flag on the green: pole, flag, hole and the edge of the green
  flag(c) {
    c.lineWidth = 0.055; c.beginPath(); c.moveTo(-0.12, 0.74); c.lineTo(-0.12, -0.88); c.stroke();
    c.beginPath(); c.moveTo(-0.12, -0.88); c.lineTo(0.58, -0.66); c.lineTo(-0.12, -0.44); c.closePath(); c.fill();
    c.lineWidth = 0.05; c.beginPath(); c.ellipse(-0.12, 0.76, 0.3, 0.085, 0, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.035; c.beginPath(); c.ellipse(0, 0.76, 0.9, 0.2, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.beginPath(); c.arc(0.42, 0.64, 0.06, 0, Math.PI * 2); c.fill();   // the ball, close to the hole
  },
  // a hole seen from above: tee, fairway, dotted shot line, green and pin
  fairway(c) {
    c.lineWidth = 0.05;
    c.beginPath(); c.moveTo(-0.82, 0.9); c.bezierCurveTo(-1.0, 0.05, 0.0, -0.1, 0.18, -0.52); c.stroke();
    c.beginPath(); c.moveTo(-0.38, 0.92); c.bezierCurveTo(-0.3, 0.32, 0.32, 0.12, 0.62, -0.3); c.stroke();
    c.beginPath(); c.arc(0.46, -0.56, 0.24, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.035; c.beginPath(); c.moveTo(0.46, -0.56); c.lineTo(0.46, -0.98); c.stroke();
    c.beginPath(); c.moveTo(0.46, -0.98); c.lineTo(0.74, -0.88); c.lineTo(0.46, -0.78); c.closePath(); c.fill();
    c.beginPath(); c.arc(-0.6, 0.78, 0.06, 0, Math.PI * 2); c.fill();
    for (let t = 0.08; t < 0.92; t += 0.07) {   // the shot, as a dotted curve from the tee to the green
      const x = (1 - t) * (1 - t) * -0.6 + 2 * (1 - t) * t * -0.35 + t * t * 0.4;
      const y = (1 - t) * (1 - t) * 0.78 + 2 * (1 - t) * t * -0.35 + t * t * -0.5;
      c.beginPath(); c.arc(x, y, 0.025, 0, Math.PI * 2); c.fill();
    }
  },
  // dos and don'ts: a check and a cross, each in a circle
  rules(c) {
    c.lineWidth = 0.05;
    c.beginPath(); c.arc(-0.5, 0, 0.42, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(0.5, 0, 0.42, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.075; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-0.7, 0.01); c.lineTo(-0.55, 0.17); c.lineTo(-0.29, -0.17); c.stroke();
    c.beginPath(); c.moveTo(0.34, -0.16); c.lineTo(0.66, 0.16); c.moveTo(0.66, -0.16); c.lineTo(0.34, 0.16); c.stroke();
  },
  // a brain in profile: outline, folds, cerebellum and brain stem
  brain(c) {
    c.lineWidth = 0.055; c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(-0.78, 0.22);
    c.bezierCurveTo(-1.0, -0.15, -0.75, -0.62, -0.32, -0.66);
    c.bezierCurveTo(-0.05, -0.82, 0.38, -0.78, 0.6, -0.55);
    c.bezierCurveTo(0.92, -0.42, 0.98, -0.02, 0.8, 0.2);
    c.bezierCurveTo(0.7, 0.36, 0.45, 0.42, 0.25, 0.36);
    c.bezierCurveTo(0.05, 0.42, -0.15, 0.4, -0.3, 0.42);
    c.bezierCurveTo(-0.55, 0.45, -0.72, 0.38, -0.78, 0.22);
    c.stroke();
    c.beginPath(); c.ellipse(-0.47, 0.5, 0.26, 0.14, -0.15, 0, Math.PI * 2); c.stroke();   // cerebellum
    c.lineWidth = 0.035;
    c.beginPath(); c.moveTo(-0.66, 0.5); c.quadraticCurveTo(-0.47, 0.44, -0.28, 0.5); c.stroke();
    c.lineWidth = 0.045;
    c.beginPath(); c.moveTo(-0.14, 0.42); c.quadraticCurveTo(-0.12, 0.64, -0.1, 0.86);       // brain stem
    c.moveTo(0.03, 0.39); c.quadraticCurveTo(0.01, 0.62, 0.03, 0.86); c.stroke();
    c.lineWidth = 0.04;                                                                         // folds
    c.beginPath(); c.moveTo(0.05, -0.74); c.bezierCurveTo(0.0, -0.5, 0.16, -0.35, 0.05, -0.1); c.stroke();
    c.beginPath(); c.moveTo(-0.42, 0.2); c.bezierCurveTo(-0.1, 0.05, 0.25, 0.12, 0.52, 0.0); c.stroke();
    [[-0.62, -0.3, -0.46, -0.46, -0.3, -0.26, -0.2, -0.42], [0.28, -0.56, 0.44, -0.4, 0.6, -0.52, 0.72, -0.3],
     [-0.72, 0.0, -0.56, -0.12, -0.46, 0.06, -0.34, -0.06], [0.34, -0.16, 0.5, -0.26, 0.6, -0.04, 0.76, -0.12],
     [-0.26, -0.14, -0.16, -0.26, -0.06, -0.08, 0.0, -0.26]].forEach(([x0, y0, a, b, cx, cy, x1, y1]) => {
      c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(a, b, cx, cy, x1, y1); c.stroke();
    });
  },
  // focus: concentric rings
  target(c) {
    c.lineWidth = 0.06;
    [0.84, 0.6, 0.36].forEach((r) => { c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke(); });
    c.beginPath(); c.arc(0, 0, 0.12, 0, Math.PI * 2); c.fill();
  },
  // open book with lines of text
  book(c) {
    c.lineWidth = 0.055; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(0, -0.48); c.quadraticCurveTo(-0.4, -0.72, -0.88, -0.6); c.lineTo(-0.88, 0.56); c.quadraticCurveTo(-0.4, 0.46, 0, 0.7); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(0, -0.48); c.quadraticCurveTo(0.4, -0.72, 0.88, -0.6); c.lineTo(0.88, 0.56); c.quadraticCurveTo(0.4, 0.46, 0, 0.7); c.closePath(); c.stroke();
    c.lineWidth = 0.03;
    for (let y = -0.38; y <= 0.36; y += 0.13) {
      c.beginPath(); c.moveTo(-0.74, y); c.lineTo(-0.14, y + 0.06); c.stroke();
      c.beginPath(); c.moveTo(0.14, y + 0.06); c.lineTo(0.74, y); c.stroke();
    }
  },
  // trophy cup
  trophy(c) {
    c.lineWidth = 0.06; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-0.5, -0.78); c.lineTo(0.5, -0.78);
    c.bezierCurveTo(0.5, -0.12, 0.26, 0.1, 0, 0.12); c.bezierCurveTo(-0.26, 0.1, -0.5, -0.12, -0.5, -0.78); c.closePath(); c.stroke();
    c.beginPath(); c.arc(-0.5, -0.46, 0.22, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(0.5, -0.46, 0.22, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    c.fillRect(-0.07, 0.12, 0.14, 0.4);
    c.strokeRect(-0.42, 0.52, 0.84, 0.2);
    c.beginPath(); c.arc(0, -0.42, 0.1, 0, Math.PI * 2); c.fill();   // a star-ish emblem
  },
  // graduation cap
  cap(c) {
    c.lineWidth = 0.06; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(0, -0.66); c.lineTo(0.96, -0.3); c.lineTo(0, 0.06); c.lineTo(-0.96, -0.3); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-0.56, -0.12); c.lineTo(-0.56, 0.34); c.quadraticCurveTo(0, 0.6, 0.56, 0.34); c.lineTo(0.56, -0.12); c.stroke();
    c.lineWidth = 0.035; c.beginPath(); c.moveTo(0, -0.3); c.lineTo(0.74, -0.08); c.lineTo(0.74, 0.46); c.stroke();
    c.fillRect(0.68, 0.46, 0.12, 0.2);
  },
  // globe: outline, equator, latitudes and meridians
  globe(c) {
    c.lineWidth = 0.055; c.beginPath(); c.arc(0, 0, 0.84, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.035;
    c.beginPath(); c.moveTo(-0.84, 0); c.lineTo(0.84, 0); c.stroke();
    [-0.44, 0.44].forEach((y) => { const hw = Math.sqrt(0.84 * 0.84 - y * y); c.beginPath(); c.moveTo(-hw, y); c.lineTo(hw, y); c.stroke(); });
    [0.42, 0.14].forEach((rx) => { c.beginPath(); c.ellipse(0, 0, rx, 0.84, 0, 0, Math.PI * 2); c.stroke(); });
  },
  // "1:1" (coaching), drawn with the display font
  oneone(c) {
    c.font = '1.55px "Bakbak One", "Arial Black", sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('1:1', 0, 0.06);
  },
};

// Shapes taken from an image instead of drawn in code: a PNG with opaque lines on a transparent
// background (public/img/icons/). The dots sample its opaque pixels, so the icon comes out exactly.
const IMAGE_SHAPES = { mind: '/img/icons/mind.png', grip: '/img/icons/grip.png' };
const imgCache = {};
function loadImage(src) {
  if (!imgCache[src]) {
    imgCache[src] = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  }
  return imgCache[src];
}
const loaded = {};   // src → HTMLImageElement once ready

const GOLD = '#f1e49b';
const CREAM = '#fbf4e6';
const GREEN = '#102c1a';   // brand primary green, for panels on cream (tone="green")

export default function ParticleShape({ shape, cycle, interval = 3800, className = '', label, tone: inkTone = 'gold' }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const api = useRef(null);   // { morph(key) } once the field is running

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    const ctx = el.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, N = 0;
    let px, py, vx, vy, tx, ty, sz, tone, ph;   // particle arrays
    let current = shape || (cycle && cycle[0]) || 'ball';
    let onScreen = false, started = false, raf = 0, timer = 0, cycleIdx = 0;
    const mouse = { x: -9999, y: -9999 };
    // transition phases: 'cluster' (gather into a ball) → 'settle' (soft spring into the next shape) → 'idle'
    let phase = 'idle', phaseT = 0, pending = null;
    const CLUSTER_MS = 1100, SETTLE_MS = 1500;
    let lastT = 0;

    // sample a shape into N target points
    const sample = (key) => {
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(W)); off.height = Math.max(1, Math.round(H));
      const o = off.getContext('2d');
      const s = Math.min(W, H) * 0.39;   // unit box → pixels (icon fills ~78% of the shorter side)
      const imgSrc = IMAGE_SHAPES[key];
      if (imgSrc) {
        const im = loaded[imgSrc];
        if (im) {   // fit the image in the same ~78% box the drawn icons use
          const box = s * 2, k = Math.min(box / im.width, box / im.height);
          o.drawImage(im, (W - im.width * k) / 2, (H - im.height * k) / 2, im.width * k, im.height * k);
        }
      }
      o.translate(W / 2, H / 2); o.scale(s, s);
      o.fillStyle = o.strokeStyle = '#fff'; o.lineCap = 'round';
      // icon lines are drawn 1.3× thicker than written: enough to read, without packing the dots
      const lwDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'lineWidth');
      Object.defineProperty(o, 'lineWidth', { get: () => lwDesc.get.call(o), set: (v) => lwDesc.set.call(o, v * 1.3) });
      if (!imgSrc) (SHAPES[key] || SHAPES.ball)(o);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const pts = [];
      const step = Math.max(2, Math.round(Math.sqrt((W * H) / 14000)));
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 120) pts.push(x + (Math.random() - 0.5) * step * 0.6, y + (Math.random() - 0.5) * step * 0.6);
        }
      }
      const out = new Float32Array(N * 2);
      const count = pts.length / 2;
      if (!count) { for (let i = 0; i < N; i++) { out[i * 2] = W / 2; out[i * 2 + 1] = H / 2; } return out; }
      // shuffle the sample points (Fisher–Yates) so the dots spread evenly over the whole icon, and so they
      // travel to random places in the new icon (a swirl rather than a slide). With more dots than points,
      // points are reused with a little jitter.
      const idx = Array.from({ length: count }, (_, i) => i);
      for (let i = count - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      for (let i = 0; i < N; i++) {
        const k = idx[i % count] * 2;
        const jit = i >= count ? 3 : 0;
        out[i * 2] = pts[k] + (Math.random() - 0.5) * jit;
        out[i * 2 + 1] = pts[k + 1] + (Math.random() - 0.5) * jit;
      }
      return out;
    };

    const setTargets = (key) => {
      const src = IMAGE_SHAPES[key];
      if (src && !loaded[src]) {
        loadImage(src).then((im) => { if (im) { loaded[src] = im; if (current === key && W && phase !== 'cluster') setTargets(key); } });
      }
      assign(sample(key));
    };

    // Give each dot the target point at the same angle around the centre (rank-matched), so the dots
    // fan out from where they are instead of criss-crossing: a smooth reaccommodation, not a swirl.
    const angleOrder = (xs, ys, n) => {
      const cx = W / 2, cy = H / 2, a = new Float32Array(n), o = new Uint32Array(n);
      for (let i = 0; i < n; i++) { a[i] = Math.atan2(ys(i) - cy, xs(i) - cx); o[i] = i; }
      return o.sort((p, q) => a[p] - a[q]);
    };
    const assign = (t) => {
      const dots = angleOrder((i) => px[i], (i) => py[i], N);
      const pts = angleOrder((i) => t[i * 2], (i) => t[i * 2 + 1], N);
      for (let r = 0; r < N; r++) { const i = dots[r], k = pts[r] * 2; tx[i] = t[k]; ty[i] = t[k + 1]; }
    };

    // the round cluster the dots gather into between shapes: a big, evenly spread disc (about the icon's size)
    // that turns slowly like a galaxy, inner dots faster than outer ones. Each dot keeps its own angle, so it
    // drifts outward/inward along a straight line rather than crossing the field.
    let ca, cr, clusterR = 0;
    const clusterTargets = () => {
      const cx = W / 2, cy = H / 2;
      clusterR = Math.min(W, H) * 0.42;
      if (!ca) { ca = new Float32Array(N); cr = new Float32Array(N); }
      for (let i = 0; i < N; i++) {
        ca[i] = Math.atan2(py[i] - cy, px[i] - cx);
        cr[i] = clusterR * Math.sqrt(Math.random());   // uniform over the disc: no dense core
        tx[i] = cx + Math.cos(ca[i]) * cr[i]; ty[i] = cy + Math.sin(ca[i]) * cr[i];
      }
    };
    const spinCluster = (dt) => {
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < N; i++) {
        ca[i] += dt * 0.0011 * (1.6 - cr[i] / clusterR);   // differential rotation: a soft spiral
        tx[i] = cx + Math.cos(ca[i]) * cr[i]; ty[i] = cy + Math.sin(ca[i]) * cr[i];
      }
    };

    const setup = () => {
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const oldW = W, oldH = H;
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(W * dpr); el.height = Math.round(H * dpr);
      if (!N) {
        N = Math.round(Math.min(1300, Math.max(420, (W * H) / 260)));
        px = new Float32Array(N); py = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N);
        tx = new Float32Array(N); ty = new Float32Array(N); sz = new Float32Array(N); tone = new Uint8Array(N); ph = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          px[i] = Math.random() * W; py[i] = Math.random() * H;   // start scattered: they gather when first seen
          sz[i] = 1.2 + Math.random() * 1.3; tone[i] = Math.random() < 0.72 ? 0 : 1; ph[i] = Math.random() * Math.PI * 2;
        }
      } else if (oldW && oldH) {
        for (let i = 0; i < N; i++) { px[i] *= W / oldW; py[i] *= H / oldH; }
      }
      setTargets(current);
      if (reduced) { for (let i = 0; i < N; i++) { px[i] = tx[i]; py[i] = ty[i]; } draw(0); }
      return true;
    };

    const draw = (time) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let pass = 0; pass < 2; pass++) {
        if (inkTone === 'green') { ctx.fillStyle = GREEN; ctx.globalAlpha = pass ? 0.8 : 1; }
        else { ctx.fillStyle = pass ? CREAM : GOLD; ctx.globalAlpha = pass ? 0.85 : 1; }
        for (let i = 0; i < N; i++) {
          if (tone[i] !== pass) continue;
          const tw = reduced ? 0 : Math.sin(time * 0.0012 + ph[i]) * 0.6;   // a gentle shimmer in place
          const d = inkTone === 'green' ? sz[i] * 1.6 : sz[i];   // bolder dots on cream
          ctx.fillRect(px[i] + tw, py[i] - tw, d, d);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (time) => {
      raf = 0;
      if (!onScreen) return;
      const R = Math.min(W, H) * 0.14, R2 = R * R;
      let k = 0.045, damp = 0.84;
      const prevT = lastT; lastT = time;
      if (phase !== 'idle') {
        const e = (time - phaseT) / (phase === 'cluster' ? CLUSTER_MS : SETTLE_MS);
        if (phase === 'cluster') {
          k = 0.04; damp = 0.85;
          spinCluster(Math.min(50, time - (prevT || time)));
          if (e >= 1) { phase = 'settle'; phaseT = time; setTargets(pending); pending = null; }
        } else {
          const p = Math.min(1, e);
          k = 0.008 + 0.037 * p * p; damp = 0.9 - 0.06 * p;   // starts soft and slow, firms up as it lands
          if (e >= 1) phase = 'idle';
        }
      }
      for (let i = 0; i < N; i++) {
        let ax = (tx[i] - px[i]) * k, ay = (ty[i] - py[i]) * k;
        const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) { const f = (1 - d2 / R2) * 3.2 / Math.sqrt(d2); ax += dx * f; ay += dy * f; }
        vx[i] = (vx[i] + ax) * damp; vy[i] = (vy[i] + ay) * damp;
        px[i] += vx[i]; py[i] += vy[i];
      }
      draw(time);
      raf = requestAnimationFrame(tick);
    };

    const morph = (key) => {
      if (!key || key === current) return;
      current = key;
      if (!W) return;
      if (reduced) { setTargets(key); for (let i = 0; i < N; i++) { px[i] = tx[i]; py[i] = ty[i]; } draw(0); return; }
      pending = key;
      if (phase === 'cluster') return;   // already gathering: it'll open into the latest shape
      phase = 'cluster'; phaseT = performance.now();
      clusterTargets();
    };
    api.current = { morph };

    const startCycle = () => {
      if (!cycle || cycle.length < 2 || reduced || timer) return;
      timer = setInterval(() => { cycleIdx = (cycleIdx + 1) % cycle.length; morph(cycle[cycleIdx]); }, interval);
    };
    const stopCycle = () => { clearInterval(timer); timer = 0; };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) {
        if (!started) started = setup();
        if (!reduced && !raf) raf = requestAnimationFrame(tick);
        startCycle();
      } else stopCycle();
    }, { rootMargin: '100px 0px' });
    io.observe(box);

    const ro = new ResizeObserver(() => { if (started) setup(); });
    ro.observe(box);
    // the "1:1" icon needs the display font loaded before it's sampled
    document.fonts?.ready.then(() => { if (started) setTargets(current); });

    const move = (e) => { const r = el.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const leave = () => { mouse.x = mouse.y = -9999; };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);

    return () => {
      io.disconnect(); ro.disconnect(); stopCycle(); cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
      api.current = null;
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // morph when the shape prop changes
  useEffect(() => { if (shape) api.current?.morph(shape); }, [shape]);

  return (
    <div ref={wrap} className={`pshape ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <canvas ref={canvas} />
    </div>
  );
}
