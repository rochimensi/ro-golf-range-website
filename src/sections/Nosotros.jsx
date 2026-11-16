export default function Nosotros() {
  return (
    <section id="nosotros" className="vs green" data-sec={250}>
      <div className="wrap">
        <header className="vh" data-reveal>
          <div className="label">250 yd · Nosotros</div>
          <h2 className="display-l">Apasionados por el golf y la innovación</h2>
          <div className="rule" />
        </header>
        <div className="about">
          <div className="about-text" data-reveal>
            <p className="body-l">En R&amp;O Golf Range somos apasionados por el golf y la innovación.</p>
            <p>Nacimos en diciembre de 2024 dentro del Club Mar del Plata, Golf Los Acantilados, con el objetivo de transformar la práctica de este deporte en la ciudad y sus alrededores.</p>
            <p>Detrás de este proyecto están la Ingeniera Rosario Mensi y el profesional de golf de la PGA Omar Peralta. Rosario aporta su visión tecnológica para ofrecer un servicio automatizado y eficiente. Omar, con una vida dedicada al golf desde su infancia temprana, es jugador profesional hace 33 años. Coach Assistant, y Caddie en el PGA Tour y en el European Tour durante más de 20 años. Su experiencia y conocimiento del juego son fundamentales para hacer de R&amp;O Golf Range un espacio de práctica de primer nivel y brindar el mejor asesoramiento y atención al público de diferentes perfiles.</p>
          </div>
          <div className="founders">
            <article className="founder" data-reveal><span className="mono">R</span><div><h3 className="heading-3">Ing. Rosario Mensi</h3><p className="caption">Visión tecnológica · servicio automatizado y eficiente</p></div></article>
            <article className="founder" data-reveal><span className="mono">O</span><div><h3 className="heading-3">Omar Peralta</h3><p className="caption">Profesional de golf PGA · Coach Assistant y Caddie</p></div></article>
            <div className="since" data-reveal><b>Dic 2024</b><span className="label">Nacimos en Los Acantilados</span></div>
          </div>
        </div>
        <div className="mv">
          <article className="mv-card" data-reveal>
            <div className="label">Visión</div>
            <p className="body-l">Queremos redefinir la práctica de este deporte, en un ambiente inclusivo que invite a jugadores de todos los niveles a mejorar su juego y disfrutar. Aspiramos a ser el espacio elegido tanto por profesionales en búsqueda de perfeccionamiento como por quienes desean dar sus primeros golpes en un entorno amigable y motivador.</p>
            <p>Desde Mar del Plata, trabajamos para posicionarnos a nivel nacional y demostrar que la evolución del golf empieza aquí.</p>
          </article>
          <article className="mv-card" data-reveal>
            <div className="label">Misión</div>
            <p className="body-l">Nuestra misión es acercar a más personas al mundo del golf con una experiencia moderna, accesible y de alto nivel.</p>
            <p>Queremos que más personas descubran la pasión por el golf en un ambiente de excelencia, aprendizaje y diversión.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
