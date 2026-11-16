export default function Clases() {
  return (
    <section id="clases" className="vs cream" data-sec={50}>
      <div className="wrap">
        <div className="split">
          <header className="vh" data-reveal>
            <div className="label">50 yd · Clases</div>
            <h2 className="display-l">Clases para todos los niveles</h2>
            <div className="rule" />
            <p className="body-l">Desde principiantes hasta alto rendimiento. Clases <strong>individuales o grupales</strong>, con Omar Peralta.</p>
            <div className="levels" aria-label="Niveles">
              <span>Principiantes</span><span>Intermedios</span><span>Avanzados</span><span>Alto rendimiento</span>
            </div>
          </header>
          <figure className="framed photo-academia" data-reveal>
            <img src="img/figma/omar-caddie.jpg" alt="Omar Peralta asesorando a un jugador en un torneo" loading="lazy" data-fallback />
            <figcaption className="missing-note">Foto pendiente · img/figma/omar-caddie.jpg</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
