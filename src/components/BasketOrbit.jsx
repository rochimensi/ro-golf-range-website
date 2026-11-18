// The basket size in the middle, with a ring of illustrative balls spinning around it.
// Ball count is decorative only (bigger basket → fuller ring), not the real amount.
const RING = { 30: 3, 60: 6, 100: 10 };

export default function BasketOrbit({ n }) {
  const count = RING[n] || 10;
  return (
    <div className="basket-orbit" aria-hidden="true">
      <div className="orbit-track" />
      <div className="orbit-ring">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="orbit-slot" style={{ '--a': `${(360 / count) * i}deg`, '--i': i }}>
            <span className="orbit-ball" />
          </span>
        ))}
      </div>
      <div className="orbit-num">
        <b>{n}</b>
        <span className="label">pelotas</span>
      </div>
    </div>
  );
}
