import BasketArt from '../components/BasketArt.jsx';
export default function Canastos() {
  return (
    <section id="canastos" className="vs green" data-sec={30}>
      <div className="wrap">
        <header className="vh" data-reveal>
          <div className="label">30 yd · Canastos</div>
          <h2 className="display-l">Elegí tu canasto</h2>
          <div className="rule" />
          <p className="body-l">Tres tamaños para practicar a tu ritmo.</p>
        </header>
        <div className="baskets">
          <article className="basket" data-reveal>
            <BasketArt n={30} />
            <div className="basket-n"><b>30</b><span className="label">pelotas</span></div>
            <p>Para calentar antes de salir a la cancha o una práctica rápida.</p>
          </article>
          <article className="basket" data-reveal>
            <BasketArt n={60} />
            <div className="basket-n"><b>60</b><span className="label">pelotas</span></div>
            <p>Una sesión completa para trabajar tu swing.</p>
          </article>
          <article className="basket" data-reveal>
            <BasketArt n={100} />
            <div className="basket-n"><b>100</b><span className="label">pelotas</span></div>
            <p>Para entrenar todo el juego, del driver al wedge.</p>
          </article>
        </div>
        <div className="benefits">
          <article className="benefit" data-reveal>
            <div className="label">Beneficio socios</div>
            <h3 className="heading-3">Club Mar del Plata · Golf Los Acantilados</h3>
            <p>Los socios del club tienen un <strong>valor preferencial</strong> en los canastos.</p>
          </article>
          <article className="benefit" data-reveal>
            <div className="label">Beneficio socios</div>
            <h3 className="heading-3">SportClub</h3>
            <p>Los socios de SportClub tienen <strong>un canasto de 30 pelotas sin cargo</strong> todas las semanas.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
