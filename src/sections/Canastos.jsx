import BasketArt from '../components/BasketArt.jsx';
import BasketOrbit from '../components/BasketOrbit.jsx';
import AutoplayVideo from '../components/AutoplayVideo.jsx';

// How the basket cards are drawn: 'orbit' (number with spinning balls) or 'heap' (original basket art).
const BASKET_STYLE = 'orbit';

const BASKETS = [
  { n: 30, text: 'Calenta antes de salir a la cancha o hace una práctica rápida.' },
  { n: 60, text: 'Sesión completa para trabajar tu swing solo o en una clase.' },
  { n: 100, text: 'Para entrenar todo el juego, de wedges al driver.' }
];

const CLIPS = ['ball_and_tee', 'balls', 'divot'];

export default function Canastos() {
  return (
    <section id="canastos" className="vs green has-cover" data-sec={30}>
      <div className="cv">
        <div className="cv-grid">
          {CLIPS.map((name) => (
            <div key={name} className={`cv-tile cv-${name}`}>
              <AutoplayVideo src={`video/${name}.mp4`} poster={`video/${name}.jpg`} preload="auto" aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="cv-shade" aria-hidden="true" />
        <h2 className="cv-title">Canastos</h2>
      </div>
      <header className="vh" data-reveal>
        <h2 className="display-l">Practica a tu ritmo</h2>
        <div className="ball-pick">
          <img className="ball-pick-logo" src="img/logo-taylormade.svg" alt="TaylorMade" width="1024" height="207" />
          <p className="body-l">
            <strong>TaylorMade Range Balls.</strong> Pelota de golf de alto rendimiento y primera calidad con construcción sólida de dos piezas, compresión de 90. Esta es nuestra pelota elegida.
          </p>
        </div>
      </header>
      <div className="wrap">
        <div className={`baskets baskets-${BASKET_STYLE}`}>
          {BASKETS.map(({ n, text }) => (
            <article key={n} className="basket" data-reveal>
              {BASKET_STYLE === 'orbit' ? (
                <BasketOrbit n={n} />
              ) : (
                <>
                  <BasketArt n={n} />
                  <div className="basket-n"><b>{n}</b><span className="label">pelotas</span></div>
                </>
              )}
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="benefits">
          <article className="benefit" data-reveal>
            <div className="benefit-logo round">
              <img src="img/logo-acantilados.png" alt="Club Mar del Plata" width="200" height="200" />
            </div>
            <div className="label">Beneficio socios</div>
            <h3 className="heading-3">Club Mar del Plata · Golf Los Acantilados</h3>
            <p>Los socios del club tienen un <strong>valor preferencial</strong> en los canastos todo el año.</p>
          </article>
          <article className="benefit" data-reveal>
            <div className="benefit-logo plain">
              <img src="img/logo-sportclub-white.png" alt="SportClub" width="560" height="107" />
            </div>
            <div className="label">Beneficio socios</div>
            <h3 className="heading-3">SportClub</h3>
            <p>Los socios de SportClub tienen <strong>un canasto sin cargo</strong> todas las semanas.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
