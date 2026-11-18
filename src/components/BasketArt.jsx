// A basket heaped with N balls; balls drop in one by one when the card is revealed.
const LAYOUT = { 30: 6, 60: 8, 100: 10 };

export default function BasketArt({ n }) {
  const cols = LAYOUT[n] || 8;
  const W = 120, r = W / cols / 2;
  const rows = Math.ceil(n / cols);
  const rowH = r * 1.75;
  const heap = rows * rowH + r;
  const basketH = Math.max(46, heap * 0.55);
  const H = heap + 12;
  const balls = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = Math.min(cols, n - row * cols);
    const offset = (cols - inRow) * r + (row % 2 ? r * 0.5 : 0);
    const x = 10 + offset + r + col * 2 * r - (row % 2 ? r * 0.5 : 0);
    const y = H - 10 - r - row * rowH;
    balls.push(<circle key={i} className="b" cx={x} cy={y} r={r * 0.9} style={{ transitionDelay: `${(i * 14) % 900}ms` }} />);
  }
  const top = H - basketH;
  return (
    <div className="basket-art" aria-hidden="true">
      <svg viewBox={`0 0 140 ${H}`}>
        <defs>
          <radialGradient id={`ball${n}`} cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#c9ccc4" /></radialGradient>
          <linearGradient id={`bk${n}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c9aa60" /><stop offset="1" stopColor="#f1e49b" /></linearGradient>
        </defs>
        <g fill={`url(#ball${n})`}>{balls}</g>
        <path d={`M4 ${top} H136 L126 ${H - 2} H14 Z`} fill="rgba(16,44,26,.82)" stroke={`url(#bk${n})`} strokeWidth="2" />
        {[0.33, 0.66].map((k) => (
          <path key={k} d={`M${4 + 5 * k} ${top + (H - 2 - top) * k} H${136 - 5 * k}`} stroke="#c9aa60" strokeOpacity=".5" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}
