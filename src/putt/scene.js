// Canvas putter scene: grass, putter, ball, hole and flag.
// Driven from outside: call render(progress 0..1, now) on every tick.
export function createPuttScene(els) {

  const { canvas: cvs, stage, track, chip, hint, cta, ruler, swingVH = { back: .2, hit: .3, follow: .42 }, scrollScreens = 5 } = els;
  const mainCtx = cvs.getContext('2d');
  let ctx = mainCtx;   // drawing helpers draw on `ctx`; it is pointed at an offscreen canvas while sprites are baked
  // build ruler ticks: 20 yards to the pin, a tick per yard, labels every 5
  const rFill = ruler.querySelector('.r-fill'), rBall = ruler.querySelector('.r-ball'), rFlag = ruler.querySelector('.r-flag');
  {
    const ticks = ruler.querySelector('.r-ticks'); ticks.innerHTML = '';
    for (let yd = 20; yd >= 1; yd--) {
      const t = document.createElement('div');
      t.className = 'tick' + (yd % 5 === 0 ? ' major' : '');
      t.style.left = ((20 - yd) / 20 * 100) + '%';
      if (yd % 5 === 0) t.innerHTML = `<span>${yd === 20 ? '20 yd' : yd}</span>`;
      ticks.appendChild(t);
    }
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const secs = [...track.querySelectorAll('.sec')];
  let worldW = 0, lastLeft = 0;
  // Swing timing is set in screen-heights of scroll (not % of the page), so it feels the same however long the page is
  // swing timing in screen-heights of scroll; the pin lasts scrollScreens screen-heights
  const P_BACK = swingVH.back / scrollScreens, P_HIT = swingVH.hit / scrollScreens, P_FOLLOW = swingVH.follow / scrollScreens;
  const P_HOLE = 0.93;   // scroll progress when ball reaches the cup
  const PUTT_YD = 20;

  let W = 0, H = 0, dpr = 1, grassPattern = null;

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- procedural grass tile (seamless) ----------
  function makeGrass() {
    const S = 512;
    const t = document.createElement('canvas');
    t.width = t.height = Math.round(S * dpr);
    const g = t.getContext('2d');
    g.scale(dpr, dpr);
    const r = rng(11);
    g.fillStyle = '#2d5a25';
    g.fillRect(0, 0, S, S);

    const offsets = [-S, 0, S];
    // soft colour variation
    for (let i = 0; i < 240; i++) {
      const x = r() * S, y = r() * S, rad = 25 + r() * 80, light = r() < .5;
      for (const ox of offsets) for (const oy of offsets) {
        const cx = x + ox, cy = y + oy;
        if (cx + rad < 0 || cx - rad > S || cy + rad < 0 || cy - rad > S) continue;
        const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grd.addColorStop(0, light ? 'rgba(140,185,80,.10)' : 'rgba(8,40,10,.13)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      }
    }
    // individual blade tips
    g.lineCap = 'round';
    for (let i = 0; i < 30000; i++) {
      const x = r() * S, y = r() * S, len = 1.4 + r() * 3.8, a = r() * Math.PI * 2;
      const h = 92 + r() * 30, s = 28 + r() * 24, l = 15 + r() * 28;
      g.strokeStyle = `hsla(${h},${s}%,${l}%,${.5 + r() * .5})`;
      g.lineWidth = .5 + r() * .9;
      const dx = Math.cos(a) * len, dy = Math.sin(a) * len;
      for (const ox of offsets) for (const oy of offsets) {
        const cx = x + ox, cy = y + oy;
        if (cx < -6 || cx > S + 6 || cy < -6 || cy > S + 6) continue;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx, cy + dy); g.stroke();
      }
    }
    const pat = ctx.createPattern(t, 'repeat');
    if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(1 / dpr));
    return pat;
  }

  // ---------- golf ball dimples (points on a sphere) ----------
  const DIMPLES = [];
  { const N = 160; for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, rr = Math.sqrt(1 - y * y), ph = i * 2.399963; DIMPLES.push([Math.cos(ph) * rr, y, Math.sin(ph) * rr]); } }
  const STRIPE = [];
  { const N = 72; for (let i = 0; i < N; i++) { const t = i / N * Math.PI * 2; STRIPE.push([0, Math.cos(t), Math.sin(t)]); } }

  function drawBall(x, y, R, angle, sink) {
    // contact shadow
    const sh = 1 - sink;
    if (sh > 0) {
      const sx = x + R * .38, sy = y + R * .48;
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 1.3);
      grd.addColorStop(0, `rgba(0,0,0,${.42 * sh})`);
      grd.addColorStop(.55, `rgba(0,0,0,${.2 * sh})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(sx, sy, R * 1.3, 0, Math.PI * 2); ctx.fill();
    }
    const r = R * (1 - .3 * sink), yy = y + R * .25 * sink;
    ctx.save();
    ctx.globalAlpha = 1 - clamp((sink - .55) / .45, 0, 1);
    const base = ctx.createRadialGradient(x - r * .35, yy - r * .4, r * .08, x, yy, r);
    base.addColorStop(0, '#ffffff'); base.addColorStop(.5, '#eff0eb'); base.addColorStop(1, '#bfc3b9');
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.clip();
    const ca = Math.cos(angle), sa = Math.sin(angle);
    for (const [px, py, pz] of DIMPLES) {
      const x2 = px * ca + pz * sa, z2 = -px * sa + pz * ca;
      if (z2 <= .05) continue;
      ctx.fillStyle = `rgba(60,64,55,${.16 * z2})`;
      ctx.beginPath();
      ctx.ellipse(x + x2 * r * .94, yy + py * r * .94, r * .085 * (.35 + .65 * Math.sqrt(1 - x2 * x2)), r * .085 * (.35 + .65 * Math.sqrt(1 - py * py)), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const hl = ctx.createRadialGradient(x - r * .4, yy - r * .45, 0, x - r * .4, yy - r * .45, r * .55);
    hl.addColorStop(0, 'rgba(255,255,255,.9)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill();

    if (sink > 0) {
      ctx.fillStyle = `rgba(5,8,4,${.8 * sink})`;
      ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ---------- generic blade putter, top-down, swinging from hands above the screen ----------
  function putterShapes(R, L, shadow) {
    const hw = R * 1.25, hh = R * 4.6, cy = L + R * .35, top = cy - hh / 2;
    const shaftX = -R * .18, shaftTop = top - R * .95;
    ctx.lineCap = 'round';

    // shaft
    if (shadow) { ctx.strokeStyle = 'rgba(0,0,0,1)'; }
    else {
      const sg = ctx.createLinearGradient(shaftX - R * .14, 0, shaftX + R * .14, 0);
      sg.addColorStop(0, '#5f656b'); sg.addColorStop(.45, '#f3f5f6'); sg.addColorStop(1, '#8d939a');
      ctx.strokeStyle = sg;
    }
    ctx.lineWidth = R * .22;
    ctx.beginPath(); ctx.moveTo(shaftX, shaftTop); ctx.lineTo(0, L * .45); ctx.stroke();
    // grip
    ctx.strokeStyle = shadow ? 'rgba(0,0,0,1)' : '#15171a';
    ctx.lineWidth = R * .52;
    ctx.beginPath(); ctx.moveTo(shaftX * .5, L * .45); ctx.lineTo(0, L * .05); ctx.stroke();
    if (!shadow) {
      ctx.strokeStyle = 'rgba(201,170,96,.95)'; ctx.lineWidth = R * .06;
      ctx.beginPath(); ctx.moveTo(shaftX * .5 + R * .08, L * .43); ctx.lineTo(R * .08, L * .08); ctx.stroke();
    }
    // plumber's neck
    ctx.strokeStyle = shadow ? 'rgba(0,0,0,1)' : '#aab0b5';
    ctx.lineWidth = R * .28;
    ctx.beginPath(); ctx.moveTo(shaftX, shaftTop); ctx.lineTo(shaftX, top + R * .1); ctx.lineTo(hw * .05, top + R * .35); ctx.stroke();

    // blade head
    if (shadow) ctx.fillStyle = 'rgba(0,0,0,1)';
    else {
      const hg = ctx.createLinearGradient(-hw / 2, 0, hw / 2, 0);
      hg.addColorStop(0, '#6c7277'); hg.addColorStop(.35, '#c9ced2'); hg.addColorStop(.62, '#f1f3f4'); hg.addColorStop(1, '#8b9196');
      ctx.fillStyle = hg;
    }
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-hw / 2, top, hw, hh, R * .38); else ctx.rect(-hw / 2, top, hw, hh);
    ctx.fill();
    if (shadow) return;

    ctx.strokeStyle = 'rgba(20,24,20,.45)'; ctx.lineWidth = 1; ctx.stroke();
    // back flange
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.fillRect(-hw / 2 + 1, top + R * .25, hw * .42, hh - R * .5);
    // brass weights
    ctx.fillStyle = '#c9aa60';
    for (const k of [-.36, .36]) { ctx.beginPath(); ctx.arc(-hw * .22, cy + hh * k, R * .2, 0, Math.PI * 2); ctx.fill(); }
    // milled face edge
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fillRect(hw / 2 - R * .1, top + R * .3, R * .06, hh - R * .6);
    // sightline
    ctx.fillStyle = '#121412';
    ctx.fillRect(-hw * .38, L - R * .045, hw * .76, R * .09);
  }

  // The putter and its soft (blurred) shadow are baked once into an offscreen sprite, then only
  // rotated each frame. Blurring on every frame was what made the first yards after impact stutter.
  let putterSprite = null, putterKey = '';
  function getPutterSprite(R, L) {
    const key = `${R}|${L}|${dpr}`;
    if (key === putterKey) return putterSprite;
    const pad = R * 3;
    const x0 = -R * 2.4 - pad, x1 = R * 2.4 + pad, y0 = -pad, y1 = L + R * 3.5 + pad;
    const c = document.createElement('canvas');
    c.width = Math.ceil((x1 - x0) * dpr); c.height = Math.ceil((y1 - y0) * dpr);
    const g = c.getContext('2d');
    const prev = ctx; ctx = g;
    g.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    g.save();
    g.translate(R * .55, R * .6);
    g.globalAlpha = .26;
    if ('filter' in g) g.filter = `blur(${Math.max(2, R * .18)}px)`;
    putterShapes(R, L, true);
    g.restore();
    g.save();
    putterShapes(R, L, false);
    g.restore();
    ctx = prev;
    putterSprite = { c, x0, y0, w: x1 - x0, h: y1 - y0 };
    putterKey = key;
    return putterSprite;
  }

  function drawPutter(pivotX, pivotY, theta, R, L) {
    const sp = getPutterSprite(R, L);
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(-theta);
    ctx.drawImage(sp.c, sp.x0, sp.y0, sp.w, sp.h);
    ctx.restore();
  }

  // ---------- hole + flag ----------
  function drawHole(hx, hy, R) {
    const cr = R * 2.4;
    const worn = ctx.createRadialGradient(hx, hy, cr * .9, hx, hy, cr * 1.9);
    worn.addColorStop(0, 'rgba(0,0,0,.18)'); worn.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = worn;
    ctx.beginPath(); ctx.arc(hx, hy, cr * 1.9, 0, Math.PI * 2); ctx.fill();

    const cup = ctx.createRadialGradient(hx, hy + cr * .25, 0, hx, hy, cr);
    cup.addColorStop(0, '#030403'); cup.addColorStop(.7, '#10150d'); cup.addColorStop(1, '#26331f');
    ctx.fillStyle = cup;
    ctx.beginPath(); ctx.arc(hx, hy, cr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = R * .16;
    ctx.beginPath(); ctx.arc(hx, hy + R * .15, cr * .8, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(hx, hy, cr, 0, Math.PI * 2); ctx.stroke();
  }

  function drawFlag(hx, hy, R, now, excite) {
    const bx = hx + R * .5, by = hy;
    const tx = bx - R * .4, ty = hy - R * 13;
    // pole shadow on the green
    ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = R * .3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + R * 7, by + R * 7.5); ctx.stroke();
    // pole: black & white bands
    const BANDS = 10;
    ctx.lineWidth = R * .3; ctx.lineCap = 'butt';
    for (let i = 0; i < BANDS; i++) {
      const a = i / BANDS, b = (i + 1) / BANDS;
      ctx.strokeStyle = i % 2 === 0 ? '#111311' : '#f7f7f2';
      ctx.beginPath();
      ctx.moveTo(bx + (tx - bx) * a, by + (ty - by) * a);
      ctx.lineTo(bx + (tx - bx) * b, by + (ty - by) * b);
      ctx.stroke();
    }
    // soft highlight along the pole for roundness
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = R * .07;
    ctx.beginPath(); ctx.moveTo(bx - R * .06, by); ctx.lineTo(tx - R * .06, ty); ctx.stroke();
    ctx.lineCap = 'round';
    // flag
    const t = now / 1000, amp = R * (.5 + 1.4 * excite);
    const w1 = Math.sin(t * 3.1) * amp, w2 = Math.sin(t * 3.1 + 1.4) * amp;
    ctx.fillStyle = '#f6f5ef';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + R * 2.5, ty + w1 * .6, tx + R * 5.2, ty + R * 1.3 + w2);
    ctx.quadraticCurveTo(tx + R * 2.5, ty + R * 2.2 + w1 * .5, tx + R * .1, ty + R * 2.8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.beginPath();
    ctx.moveTo(tx, ty + R * 1.4);
    ctx.quadraticCurveTo(tx + R * 2.5, ty + R * 2.2 + w1 * .5, tx + R * .1, ty + R * 2.8);
    ctx.closePath(); ctx.fill();
  }

  // ---------- sizing ----------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    grassPattern = makeGrass();
    layout();
  }

  // Section widths: normal sections are one screen wide; the gallery is as wide as its photos
  function layout() {
    let x = 0;
    for (const sec of secs) {
      sec.style.left = x + 'px';
      let w = W;
      if (sec.hasAttribute("data-gallery")) w = Math.max(W * 2, sec.offsetWidth);
      x += w;
      lastLeft = sec.offsetLeft;
    }
    lastLeft = secs[secs.length - 1].offsetLeft;
    worldW = x;
    track.style.width = worldW + 'px';
  }
  resize();

  // ---------- main loop ----------
  let sunkAt = null, lastChip = '';

  function render(p, now) {
    const R = clamp(Math.min(W, H) * .024, 10, 21);
    const ballY = H * .72;
    const x0 = W * .45;                                   // ball rest position & camera anchor
    const holeX = lastLeft + W * .7;
    const ballEndX = holeX - R * .7;

    // ball travel: fast off the face, decelerating into the cup
    // steady roll past the content, then a smooth deceleration over the last stretch into the cup
    let g = 0;
    if (p > P_HIT) {
      const t = seg(p, P_HIT, P_HOLE);
      const f = clamp((W * .3) / Math.max(1, ballEndX - x0), .005, .5);
      const tf = 2 * f / (1 + f);
      if (t < 1 - tf) g = (t / (1 - tf)) * (1 - f);
      else { const u = (t - (1 - tf)) / tf; g = (1 - f) + f * (1 - (1 - u) * (1 - u)); }
    }
    const ballX = x0 + (ballEndX - x0) * g;
    // breaking line: up, down, then settles back onto the cup's line
    const breakAmp = H * .075;
    const ballYNow = ballY - breakAmp * Math.sin(3 * Math.PI * g) * (1 - .45 * g);
    // camera eases into the pan instead of jumping to full speed at impact: it starts still and
    // accelerates smoothly until it matches the ball, which settles a little ahead of where it started
    const travel = ballX - x0, lag = W * .15;
    const camX = clamp(travel - lag * (1 - Math.exp(-travel / lag)), 0, worldW - W);

    // sink state (time-based one-shot once the ball arrives)
    if (g >= 1 && sunkAt === null) sunkAt = now;
    if (p < P_HOLE - .015 && sunkAt !== null) { sunkAt = null; cta.classList.remove('show'); }
    const sink = sunkAt === null ? 0 : clamp((now - sunkAt) / 650, 0, 1);
    if (sunkAt !== null && now - sunkAt > 450) cta.classList.add('show');

    // putter pendulum
    const L = H * 1.15, headW = R * 1.25;
    const pivotX = x0 - R - headW / 2, pivotY = ballY - L;
    const thA = -Math.asin(.6 * R / L), thB = -Math.asin(5 * R / L), thF = Math.asin(3.2 * R / L);
    let th;
    if (p < P_BACK) th = thA + (thB - thA) * easeInOut(seg(p, 0, P_BACK));          // takeaway starts on the first scroll
    else if (p < P_HIT) th = thB * (1 - Math.pow(seg(p, P_BACK, P_HIT), 2));          // accelerating downswing
    else th = thF * (1 - Math.pow(1 - seg(p, P_HIT, P_FOLLOW), 2));                    // follow-through

    // ---- draw ----
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();
    ctx.translate(-camX, 0);

    ctx.fillStyle = grassPattern;
    ctx.fillRect(camX, 0, W, H);

    // mowing stripes (world-space)
    const SW = Math.max(150, W * .14);
    for (let k = Math.floor(camX / SW) - 1; k * SW < camX + W + SW; k++) {
      ctx.fillStyle = k % 2 === 0 ? 'rgba(255,255,230,.045)' : 'rgba(0,25,0,.05)';
      ctx.fillRect(k * SW, 0, SW, H);
    }

    drawHole(holeX, ballY, R);
    if (g < 1 || sink < 1) drawBall(ballX, ballYNow, R, (ballX - x0) / R, sink);
    if (pivotX + R * 6 > camX && pivotX - R * 6 < camX + W) drawPutter(pivotX, pivotY, th, R, L);
    drawFlag(holeX, ballY, R, now, sink > 0 ? Math.max(0, 1 - (now - sunkAt) / 2500) : 0);

    ctx.restore();

    // light + vignette (screen-space)
    const light = ctx.createLinearGradient(0, 0, 0, H);
    light.addColorStop(0, 'rgba(255,244,210,.07)'); light.addColorStop(.5, 'rgba(0,0,0,0)'); light.addColorStop(1, 'rgba(0,0,0,.12)');
    ctx.fillStyle = light; ctx.fillRect(0, 0, W, H);
    const vig = ctx.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .35, W / 2, H * .55, Math.max(W, H) * .8);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(16,44,26,.55)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

    // ---- DOM ----
    track.style.transform = `translate3d(${-camX}px,0,0)`;
    hint.style.opacity = String(1 - seg(p, 0, .03));
    let txt;
    if (sunkAt !== null) txt = '¡Embocada!';
    else if (p <= P_HIT) txt = `Putt de ${PUTT_YD} yardas`;
    else { const yd = Math.max(1, Math.round(PUTT_YD * (1 - g))); txt = yd === 1 ? 'Falta 1 yarda al hoyo' : `Faltan ${yd} yardas al hoyo`; }
    if (txt !== lastChip) { chip.textContent = txt; lastChip = txt; }
    const pct = (g * 100).toFixed(2) + '%';
    rFill.style.width = pct; rBall.style.left = pct;
    const holed = sunkAt !== null;
    rBall.style.opacity = holed ? '0' : '1';
    rFlag.classList.toggle('hit', holed);
  }

  return { render, resize, layout };
}
