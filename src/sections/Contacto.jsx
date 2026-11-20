export default function Contacto() {
  return (
    <section id="contacto" className="vs green" data-sec={300}>
      <div className="wrap">
        <header className="vh" data-reveal>
          <h2 className="display-l">Contactanos</h2>
        </header>
        <div className="contacts">
          <a className="contact" data-reveal href="https://wa.me/5491159841197" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /><path d="M9 9.5c.3 2 2.3 4.4 5 5l1.2-1.2 2 1-.6 1.6c-3.6.4-8.4-3.6-8.4-8l1.6-.6 1 2z" /></svg>
            <span className="label">WhatsApp</span><span className="c-val">+54 9 11 5984-1197</span>
          </a>
          <a className="contact" data-reveal href="https://ig.me/m/ro.golfrange" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={3} width={18} height={18} rx={5} /><circle cx={12} cy={12} r={4} /><circle cx="17.3" cy="6.7" r={1} fill="currentColor" stroke="none" /></svg>
            <span className="label">Instagram</span><span className="c-val">Mensaje directo a @ro.golfrange</span>
          </a>
          <a className="contact" data-reveal href="mailto:rogolfrange@gmail.com">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={5} width={18} height={14} rx={2} /><path d="m3 7 9 6 9-6" /></svg>
            <span className="label">Email</span><span className="c-val">rogolfrange@gmail.com</span>
          </a>
        </div>
        <div className="location" id="ubicacion">
          <div className="map" data-reveal>
{/* Sketch traced from Google Maps around the pin (north up): Av. Jorge Newbery on the diagonal, the club's
                course west of it, the pin at C. 34 y C. 493, the coast and Ruta 11 to the southeast. */}
            <svg viewBox="0 0 600 420" role="img" aria-label="Mapa ilustrativo: R&amp;O Golf Range dentro del Club Mar del Plata Golf Los Acantilados, en Calle 34 y Calle 493, junto a la Av. Jorge Newbery">
              <defs>
                <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c9aa60" /><stop offset="1" stopColor="#f1e49b" /></linearGradient>
                <pattern id="waves" width="28" height="12" patternUnits="userSpaceOnUse"><path d="M0 6q7-6 14 0t14 0" fill="none" stroke="#c9aa60" strokeOpacity=".35" strokeWidth="1" /></pattern>
                <clipPath id="mapframe"><rect width="600" height="420" /></clipPath>
              </defs>
              <g clipPath="url(#mapframe)">
                <rect width="600" height="420" fill="#102c1a" />
                {/* street grid */}
                <path d="M177.2 729.5L-289.5 262.8 M226.7 835.5L905.5 156.7 M208.3 698.4L-258.4 231.7 M195.6 804.4L874.4 125.6 M239.4 667.2L-227.2 200.6 M164.5 773.3L843.3 94.5 M270.6 636.1L-196.1 169.4 M133.4 742.2L812.2 63.4 M301.7 605.0L-165.0 138.3 M102.3 711.1L781.1 32.3 M332.8 573.9L-133.9 107.2 M71.2 680.0L750.0 1.2 M363.9 542.8L-102.8 76.1 M40.0 648.9L718.9 -30.0 M395.0 511.7L-71.7 45.0 M8.9 617.7L687.7 -61.1 M426.1 480.6L-40.6 13.9 M-22.2 586.6L656.6 -92.2 M457.2 449.5L-9.5 -17.2 M-53.3 555.5L625.5 -123.3 M488.3 418.3L21.7 -48.3 M-84.4 524.4L594.4 -154.4 M519.5 387.2L52.8 -79.5 M-115.5 493.3L563.3 -185.5 M550.6 356.1L83.9 -110.6 M-146.6 462.2L532.2 -216.6 M581.7 325.0L115.0 -141.7 M-177.7 431.1L501.1 -247.7 M612.8 293.9L146.1 -172.8 M-208.9 400.0L470.0 -278.9 M643.9 262.8L177.2 -203.9 M-240.0 368.8L438.8 -310.0 M675.0 231.7L208.3 -235.0 M-271.1 337.7L407.7 -341.1 M706.1 200.6L239.4 -266.1 M-302.2 306.6L376.6 -372.2 M737.2 169.4L270.6 -297.2 M-333.3 275.5L345.5 -403.3 M768.4 138.3L301.7 -328.4 M-364.4 244.4L314.4 -434.4 M799.5 107.2L332.8 -359.5 M-395.5 213.3L283.3 -465.5 M830.6 76.1L363.9 -390.6 M-426.6 182.2L252.2 -496.6" stroke="#3f5443" strokeWidth="1" fill="none" />
                {/* the club's course */}
                <polygon points="160.2,271.3 263.5,168.0 170.1,74.7 66.9,177.9" fill="#203a28" stroke="#c9aa60" strokeOpacity=".6" strokeDasharray="4 4" />
                {/* Cam. de Los Pioneros, C. 34, C. 493, Av. Jorge Newbery */}
                <path d="M382.3 524.4L-84.4 57.7" stroke="#c0c2b3" strokeWidth="2" strokeOpacity=".75" fill="none" />
                <path d="M0.4 439.6L509.6 -69.6" stroke="#c0c2b3" strokeWidth="1.5" fill="none" />
                <path d="M389.3 319.3L255.0 185.0" stroke="#c0c2b3" strokeWidth="1.5" fill="none" />
                <path d="M-51.9 528.7L598.7 -121.9" stroke="#c0c2b3" strokeWidth="3.5" fill="none" />
                {/* sea, Ruta 11 and the coastline */}
                <path d="M-6.6 658.8Q173.7 527.9 242.7 469.6Q311.6 411.3 384.1 356.5Q456.5 301.7 526.1 258.2Q595.8 214.7 665.8 171.6Q735.8 128.4 815.3 80.7L894.9 33.0 L1000 800 L-200 800 Z" fill="#102c1a" />
                <path d="M-6.6 658.8Q173.7 527.9 242.7 469.6Q311.6 411.3 384.1 356.5Q456.5 301.7 526.1 258.2Q595.8 214.7 665.8 171.6Q735.8 128.4 815.3 80.7L894.9 33.0 L1000 800 L-200 800 Z" fill="url(#waves)" />
                <path d="M-16.5 648.9Q163.8 518.0 232.8 459.7Q301.7 401.4 374.1 346.6Q446.6 291.8 516.2 248.3Q585.9 204.8 655.9 161.7Q725.9 118.5 805.5 70.8L885.0 23.1" stroke="#c0c2b3" strokeWidth="2" strokeOpacity=".6" fill="none" />
                <path d="M-6.6 658.8Q173.7 527.9 242.7 469.6Q311.6 411.3 384.1 356.5Q456.5 301.7 526.1 258.2Q595.8 214.7 665.8 171.6Q735.8 128.4 815.3 80.7L894.9 33.0" stroke="url(#gg)" strokeWidth="2" fill="none" />
                <text x="393.6" y="111.5" fill="#c0c2b3" fontFamily="Bakbak One, Arial Black" fontSize="12" letterSpacing="2" textAnchor="middle" transform="rotate(-45 393.6 111.5)">AV. JORGE NEWBERY</text>
                <text x="62.7" y="363.2" fill="#c0c2b3" fontFamily="Bakbak One, Arial Black" fontSize="11" letterSpacing="2" textAnchor="middle" transform="rotate(-45 62.7 363.2)">C. 34</text>
                <text x="346.9" y="262.8" fill="#c0c2b3" fontFamily="Bakbak One, Arial Black" fontSize="11" letterSpacing="2" textAnchor="middle" transform="rotate(45 346.9 262.8)">C. 493</text>
                <text x="82.4" y="223.9" fill="#c0c2b3" fillOpacity=".8" fontFamily="Bakbak One, Arial Black" fontSize="10" letterSpacing="1.5" textAnchor="middle" dy="-6" transform="rotate(45 82.4 223.9)">CAM. DE LOS PIONEROS</text>
                <text x="443.1" y="274.1" fill="#c0c2b3" fillOpacity=".7" fontFamily="Bakbak One, Arial Black" fontSize="10" letterSpacing="1.5" textAnchor="middle" transform="rotate(-33 443.1 274.1)">RUTA 11</text>
                <text x="165" y="168" fill="#f1e49b" fontFamily="Bakbak One, Arial Black" fontSize="11" letterSpacing="1.5" textAnchor="middle">GOLF LOS</text>
                <text x="165" y="182" fill="#f1e49b" fontFamily="Bakbak One, Arial Black" fontSize="11" letterSpacing="1.5" textAnchor="middle">ACANTILADOS</text>
                <text x="300" y="318" fill="#c0c2b3" fillOpacity=".55" fontFamily="Bakbak One, Arial Black" fontSize="10" letterSpacing="3" textAnchor="middle">LOS ACANTILADOS</text>
                <text x="488" y="150" fill="#c0c2b3" fillOpacity=".55" fontFamily="Bakbak One, Arial Black" fontSize="10" letterSpacing="3" textAnchor="middle">SAN PATRICIO</text>
                <text x="500" y="378" fill="#c9aa60" fillOpacity=".85" fontFamily="Bakbak One, Arial Black" fontSize="12" letterSpacing="3" textAnchor="middle" transform="rotate(-33 500 378)">MAR ARGENTINO</text>
              </g>
              <g className="pin" transform="translate(255 185)">
                <circle r="22" fill="#c9aa60" fillOpacity=".18"><animate attributeName="r" values="12;26;12" dur="2.4s" repeatCount="indefinite" /><animate attributeName="fill-opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite" /></circle>
                <path d="M0 0V-46" stroke="#fbf4e6" strokeWidth="2" />
                <path d="M1-46 26-38 1-30z" fill="url(#gg)" />
                <circle r="5" fill="#fbf4e6" stroke="#102c1a" strokeWidth="2" />
              </g>
              <g transform="translate(560 40)" fill="none" stroke="#c0c2b3"><path d="M0 14V-10M-6-4 0-10 6-4" /><text x="-4" y="30" fill="#c0c2b3" stroke="none" fontFamily="Bakbak One, Arial Black" fontSize="11">N</text></g>
            </svg>
          </div>
          <div className="loc-text" data-reveal>
            <div className="label">Ubicación</div>
            <h3 className="heading-2">Club Mar del Plata · “Golf Los Acantilados”</h3>
            <p className="body-l">R&amp;O Golf Range y la Academia Omar Peralta se encuentran dentro del Club Mar del Plata “Golf Los Acantilados”, C.34 y C. 493, Mar del Plata, Argentina.</p>
            <p className="hours"><span className="label">Abierto todo el año</span><br />De lunes a lunes, de 8 a 18 h</p>
            <a className="btn gold" href="https://www.google.com/maps/search/?api=1&query=R%26O+Golf+Range+-+Academia+Omar+Peralta" target="_blank" rel="noopener">Cómo llegar ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}
