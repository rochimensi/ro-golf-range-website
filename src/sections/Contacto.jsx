export default function Contacto() {
  return (
    <section id="contacto" className="vs green" data-sec={300}>
      <div className="wrap">
        <header className="vh" data-reveal>
          <div className="label">300 yd · Contacto</div>
          <h2 className="display-l">Hablemos</h2>
          <div className="rule" />
        </header>
        <div className="contacts">
          <a className="contact" data-reveal href="#contacto" aria-disabled="true">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /><path d="M9 9.5c.3 2 2.3 4.4 5 5l1.2-1.2 2 1-.6 1.6c-3.6.4-8.4-3.6-8.4-8l1.6-.6 1 2z" /></svg>
            <span className="label">WhatsApp</span><span className="c-val">Número a confirmar</span>
          </a>
          <a className="contact" data-reveal href="https://ig.me/m/ro.golfrange" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={3} width={18} height={18} rx={5} /><circle cx={12} cy={12} r={4} /><circle cx="17.3" cy="6.7" r={1} fill="currentColor" stroke="none" /></svg>
            <span className="label">Instagram</span><span className="c-val">Mensaje directo a @ro.golfrange</span>
          </a>
          <a className="contact" data-reveal href="#contacto" aria-disabled="true">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={5} width={18} height={14} rx={2} /><path d="m3 7 9 6 9-6" /></svg>
            <span className="label">Email</span><span className="c-val">Dirección a confirmar</span>
          </a>
        </div>
        <div className="location" id="ubicacion">
          <div className="map" data-reveal>
            <svg viewBox="0 0 600 420" role="img" aria-label="Mapa ilustrativo: Club Mar del Plata Golf Los Acantilados, en Calle 34 y Calle 493">
              <defs>
                <linearGradient id="gg" x1={0} y1={0} x2={1} y2={1}><stop offset={0} stopColor="#c9aa60" /><stop offset={1} stopColor="#f1e49b" /></linearGradient>
                <pattern id="waves" width={28} height={12} patternUnits="userSpaceOnUse"><path d="M0 6q7-6 14 0t14 0" fill="none" stroke="#c9aa60" strokeOpacity=".35" strokeWidth={1} /></pattern>
              </defs>
              <rect width={600} height={420} fill="#102c1a" />
              <path d="M600 0H470q-30 60-10 120t-40 140q-40 70-20 160H600z" fill="url(#waves)" />
              <path d="M470 0q-30 60-10 120t-40 140q-40 70-20 160" fill="none" stroke="url(#gg)" strokeWidth={2} />
              <g stroke="#3f5443" strokeWidth={1}>
                <path d="M0 70H450M0 150H440M0 230H420M0 310H400M0 390H395" />
                <path d="M60 0V420M150 0V420M240 0V420M330 0V420" />
              </g>
              <path d="M0 230H420" stroke="#c0c2b3" strokeWidth={3} />
              <path d="M240 0V420" stroke="#c0c2b3" strokeWidth={3} />
              <text x={12} y={222} fill="#c0c2b3" fontFamily="Bakbak One, Arial Black" fontSize={13} letterSpacing={2}>C. 493</text>
              <text x={248} y={18} fill="#c0c2b3" fontFamily="Bakbak One, Arial Black" fontSize={13} letterSpacing={2}>C. 34</text>
              <path d="M262 250q60-30 110 0t20 90q-40 40-110 20t-20-110z" fill="#203a28" stroke="#c9aa60" strokeOpacity=".6" strokeDasharray="4 4" />
              <text x={300} y={320} fill="#f1e49b" fontFamily="Bakbak One, Arial Black" fontSize={11} letterSpacing="1.5">GOLF LOS</text>
              <text x={296} y={334} fill="#f1e49b" fontFamily="Bakbak One, Arial Black" fontSize={11} letterSpacing="1.5">ACANTILADOS</text>
              <text x={508} y={300} fill="#c9aa60" fillOpacity=".8" fontFamily="Bakbak One, Arial Black" fontSize={12} letterSpacing={3} transform="rotate(-70 508 300)">MAR ARGENTINO</text>
              <g className="pin" transform="translate(240 230)">
                <circle r={22} fill="#c9aa60" fillOpacity=".18"><animate attributeName="r" values="12;26;12" dur="2.4s" repeatCount="indefinite" /><animate attributeName="fill-opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite" /></circle>
                <path d="M0 0V-46" stroke="#fbf4e6" strokeWidth={2} />
                <path d="M1-46 26-38 1-30z" fill="url(#gg)" />
                <circle r={5} fill="#fbf4e6" stroke="#102c1a" strokeWidth={2} />
              </g>
              <g transform="translate(560 40)" fill="none" stroke="#c0c2b3"><path d="M0 14V-10M-6-4 0-10 6-4" /><text x={-4} y={30} fill="#c0c2b3" stroke="none" fontFamily="Bakbak One, Arial Black" fontSize={11}>N</text></g>
            </svg>
            <p className="caption map-note">Mapa ilustrativo</p>
          </div>
          <div className="loc-text" data-reveal>
            <div className="label">Ubicación</div>
            <h3 className="heading-2">Club Mar del Plata · “Golf Los Acantilados”</h3>
            <p className="body-l">R&amp;O Golf Range y la Academia Omar Peralta se encuentran en el Club Mar del Plata “Golf Los Acantilados”, C.34 y C. 493, Mar del Plata, Argentina.</p>
            <p className="hours"><span className="label">Abierto todo el año</span><br />De lunes a lunes</p>
            <a className="btn gold" href="https://www.google.com/maps/search/?api=1&query=Club+Mar+del+Plata+Golf+Los+Acantilados" target="_blank" rel="noopener">Cómo llegar ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}
