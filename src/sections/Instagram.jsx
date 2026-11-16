export default function Instagram() {
  return (
    <section id="instagram" className="vs cream" data-sec={200}>
      <div className="wrap">
        <div className="ig" data-reveal>
          <svg className="ig-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={3} width={18} height={18} rx={5} /><circle cx={12} cy={12} r={4} /><circle cx="17.3" cy="6.7" r={1} fill="currentColor" stroke="none" /></svg>
          <div>
            <div className="label">Seguinos en Instagram</div>
            <h2 className="display-l">@ro.golfrange</h2>
            <p className="body-l">Compartimos información, anécdotas y tips que te van a servir en tu práctica.</p>
          </div>
          <a className="btn primary-green" href="https://www.instagram.com/ro.golfrange/" target="_blank" rel="noopener">Seguinos</a>
        </div>
      </div>
    </section>
  );
}
