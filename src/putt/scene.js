import { STACKED } from '../layout.js';

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
  // (phones get a shorter pin, so the page can change it with setScreens)
  let P_BACK, P_HIT, P_FOLLOW;
  function setScreens(s) { P_BACK = swingVH.back / s; P_HIT = swingVH.hit / s; P_FOLLOW = swingVH.follow / s; }
  setScreens(scrollScreens);
  const P_HOLE = 0.93;   // scroll progress when ball reaches the cup
  const PUTT_YD = 20;

  let W = 0, H = 0, dpr = 1, grassPattern = null, grassDpr = 0;

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
    // contact shadow (smaller once the ball sits on the cup's base)
    const sh = 1 - .55 * sink;
    if (sh > 0) {
      const sx = x + R * .38, sy = y + R * .48;
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 1.3);
      grd.addColorStop(0, `rgba(0,0,0,${.42 * sh})`);
      grd.addColorStop(.55, `rgba(0,0,0,${.2 * sh})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(sx, sy, R * 1.3, 0, Math.PI * 2); ctx.fill();
    }
    // once holed it stays visible, resting a little smaller (deeper) on the cup's base
    const r = R * (1 - .15 * sink), yy = y;
    ctx.save();
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

    if (sink > 0) {   // a touch of shade from the cup wall
      ctx.fillStyle = `rgba(20,24,18,${.16 * sink})`;
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

  // ---------- hole (cup only, no flagstick) ----------
  // A white plastic cup seen from above (like a real putting cup): the turf around it is worn a little darker,
  // a thin ring of cut soil frames it, the white liner's inner wall is shaded by the light (which comes from
  // the upper left), and its base has ten dark slots between spokes around the flagstick socket.
  const CUP_R = 2.4;                                    // cup radius, in ball radii (a real cup is ~2.5× a ball)
  const floorCenter = (hx, hy, R) => [hx - R * CUP_R * .07, hy + R * CUP_R * .09];
  function drawHole(hx, hy, R) {
    const cr = R * CUP_R;
    const worn = ctx.createRadialGradient(hx, hy, cr * .95, hx, hy, cr * 1.9);
    worn.addColorStop(0, 'rgba(0,0,0,.2)'); worn.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = worn;
    ctx.beginPath(); ctx.arc(hx, hy, cr * 1.9, 0, Math.PI * 2); ctx.fill();

    // cut-soil ring where the turf meets the liner
    ctx.fillStyle = '#2e2416';
    ctx.beginPath(); ctx.arc(hx, hy, cr * 1.065, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(70,52,30,.9)'; ctx.lineWidth = Math.max(1, R * .06);
    ctx.beginPath(); ctx.arc(hx, hy, cr * 1.035, 0, Math.PI * 2); ctx.stroke();

    // liner: the inner wall, shadowed on the upper-left side, lit on the lower-right
    const wall = ctx.createLinearGradient(hx - cr, hy - cr, hx + cr, hy + cr);
    wall.addColorStop(0, '#9fa29a'); wall.addColorStop(.45, '#d9dad3'); wall.addColorStop(1, '#fbfbf7');
    ctx.fillStyle = wall;
    ctx.beginPath(); ctx.arc(hx, hy, cr, 0, Math.PI * 2); ctx.fill();
    // soft shadow just under the rim, deepest on the upper-left
    const lip = ctx.createRadialGradient(hx + cr * .12, hy + cr * .12, cr * .78, hx, hy, cr);
    lip.addColorStop(0, 'rgba(0,0,0,0)'); lip.addColorStop(1, 'rgba(20,24,18,.28)');
    ctx.fillStyle = lip;
    ctx.beginPath(); ctx.arc(hx, hy, cr, 0, Math.PI * 2); ctx.fill();

    // base: seen a little off-centre through the opening (perspective), with slots between ten spokes
    const [fx, fy] = floorCenter(hx, hy, R), fr = cr * .76;
    ctx.save();
    ctx.beginPath(); ctx.arc(hx, hy, cr * .985, 0, Math.PI * 2); ctx.clip();   // keep the base inside the opening
    const base = ctx.createRadialGradient(fx - fr * .3, fy - fr * .3, fr * .1, fx, fy, fr);
    base.addColorStop(0, '#f4f4ef'); base.addColorStop(1, '#d4d5ce');
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
    const SLOTS = 10, step = (Math.PI * 2) / SLOTS, rIn = fr * .38, rOut = fr * .86;
    ctx.fillStyle = '#33372f';
    for (let i = 0; i < SLOTS; i++) {
      const a0 = i * step + step * .13, a1 = (i + 1) * step - step * .13;
      ctx.beginPath();
      ctx.arc(fx, fy, rOut, a0, a1);
      ctx.arc(fx, fy, rIn, a1 - step * .06, a0 + step * .06, true);
      ctx.closePath(); ctx.fill();
    }
    // flagstick socket in the middle
    ctx.fillStyle = '#e9eae4';
    ctx.beginPath(); ctx.arc(fx, fy, fr * .3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(fx, fy, fr * .3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3a3227';
    ctx.beginPath(); ctx.arc(fx, fy, fr * .17, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // crisp rim
    ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = Math.max(1, R * .08);
    ctx.beginPath(); ctx.arc(hx, hy, cr, Math.PI * .1, Math.PI * .9); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx, hy, cr, 0, Math.PI * 2); ctx.stroke();
  }


  // ---------- sizing ----------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    // The grass tile doesn't depend on the screen size, only on the pixel density, so it's built once. (It was
    // rebuilt on every ScrollTrigger refresh, ~6 times while the page loads, and each build froze the headline.)
    if (!grassPattern || grassDpr !== dpr) { grassPattern = makeGrass(); grassDpr = dpr; }
    layout();
  }

  // Section widths: normal sections are one screen wide; the gallery is as wide as its photos; panels laid
  // out on a design board hug their cards (they end at the rightmost card), so the next panel follows closer.
  function boardWidth(board) {
    if (getComputedStyle(board).position !== 'absolute') return null;   // phones: cards stack, panel stays full width
    const cards = [...board.children, ...board.querySelectorAll('.svc')].filter((el) => !el.classList.contains('svc-list'));
    return Math.ceil(Math.max(...cards.map((el) => el.offsetLeft + el.offsetWidth)));
  }
  function layout() {
    let x = 0;
    for (const sec of secs) {
      sec.style.left = x + 'px';
      sec.style.width = '';
      let w = W;
      if (sec.hasAttribute("data-gallery")) w = Math.max(W * 2, sec.offsetWidth);
      const board = sec.querySelector('.board');
      if (board && sec !== secs[secs.length - 1]) {   // the last panel (the cup) stays a full screen wide
        board.style.width = '';
        const bw = boardWidth(board);
        if (bw) { board.style.width = bw + 'px'; w = board.offsetLeft + bw; sec.style.width = w + 'px'; }
      }
      // Phones: every panel is exactly one screen wide, so content runs edge to edge into the next one. Leave a
      // stretch of grass after the hero and after the first card panel.
      if (secs.indexOf(sec) < 2 && window.matchMedia(STACKED).matches) w += Math.round(W * 0.35);
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
    // breaking line: drifts up first, then curves down below the line and settles back onto the cup's line.
    // Tuned to the four-panel designs: ~5% of the height above the line on panel 1, ~5% below on panel 2.
    const breakAmp = H * .08;
    const ballYNow = ballY - breakAmp * Math.sin(2 * Math.PI * g) * (1 - .45 * g);
    // camera eases into the pan instead of jumping to full speed at impact: it starts still and
    // accelerates smoothly until it matches the ball, which settles a little ahead of where it started
    const travel = ballX - x0, lag = W * .15;
    const camX = clamp(travel - lag * (1 - Math.exp(-travel / lag)), 0, worldW - W);

    // sink state (time-based one-shot once the ball arrives)
    if (g >= 1 && sunkAt === null) sunkAt = now;
    if (p < P_HOLE - .015 && sunkAt !== null) sunkAt = null;
    const sink = sunkAt === null ? 0 : clamp((now - sunkAt) / 650, 0, 1);
    // The closing card shows up while the ball is still rolling (last 4 yards), so there's time to read it even
    // on a fast scroll; its "¡Embocada!" kicker only appears once the ball drops.
    const G_CARD = 1 - 4 / PUTT_YD;
    if (g >= G_CARD) cta.classList.add('show');
    else if (g < G_CARD - .02) cta.classList.remove('show');
    cta.classList.toggle('holed', sunkAt !== null);

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
    // after it drops, the ball settles on the cup's base, a little off-centre (and stays there)
    let bx = ballX, by = ballYNow;
    if (sink > 0) {
      const [fx, fy] = floorCenter(holeX, ballY, R), e = 1 - Math.pow(1 - sink, 3);
      bx += (fx - R * .35 - bx) * e; by += (fy + R * .1 - by) * e;
    }
    drawBall(bx, by, R, (bx - x0) / R, sink);
    if (pivotX + R * 6 > camX && pivotX - R * 6 < camX + W) drawPutter(pivotX, pivotY, th, R, L);

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
    else { const yd = Math.max(1, Math.round(PUTT_YD * (1 - g))); txt = yd === 1 ? '1 yarda al hoyo' : `${yd} yardas al hoyo`; }
    if (txt !== lastChip) { chip.textContent = txt; lastChip = txt; }
    const pct = (g * 100).toFixed(2) + '%';
    rFill.style.width = pct; rBall.style.left = pct;
    const holed = sunkAt !== null;
    rBall.style.opacity = holed ? '0' : '1';
    rFlag.classList.toggle('hit', holed);
    return camX;   // where the camera is, so the page can react to which panel is on screen
  }

  // how far the camera pans sideways over the whole putt, in px
  const travel = () => Math.max(0, worldW - W);

  return { render, resize, layout, setScreens, travel };
}
