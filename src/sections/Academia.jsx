import ScrollHighlight from '../components/ScrollHighlight.jsx';

export default function Academia() {
  return (
    <section id="academia" className="vs green" data-sec={50}>
      <div className="wrap">
        <header className="vh center" data-reveal>
          <div className="label">Academia Omar Peralta</div>
          <h2 className="display-l">Una escuela de valores</h2>
          <div className="rule mx" />
          <p className="body-l">Aprender a jugar al golf no solo es una actividad deportiva, sino una verdadera escuela de valores y enseñanzas que acompañarán a lo largo de la vida.</p>
        </header>
        <div className="values">
          <article className="value" data-reveal><span className="leaf">01</span><h3 className="label">Disciplina</h3><p>El golf es un deporte que exige disciplina, paciencia, autocontrol y una profunda capacidad de concentración, cualidades esenciales para afrontar los desafíos de la vida adulta.</p></article>
          <article className="value" data-reveal><span className="leaf">02</span><h3 className="label">Honestidad</h3><p>Desde muy temprana edad, el golf enseña el valor de la honestidad, ya que es uno de los pocos deportes donde cada jugador es su propio árbitro. Ser honesto con uno mismo y reconocer errores sin que nadie lo exija, es una lección que trasciende el campo de juego y prepara a los jóvenes para actuar con integridad en cualquier ámbito.</p></article>
          <article className="value" data-reveal><span className="leaf">03</span><h3 className="label">Respeto</h3><p>El respeto es otro pilar fundamental del golf: respeto por las reglas, por el compañero, por el campo y por el propio juego. En la vida, aprender a respetar a los demás y a uno mismo abre puertas y construye relaciones sanas y duraderas.</p></article>
          <article className="value" data-reveal><span className="leaf">04</span><h3 className="label">Resiliencia</h3><p>Además, el golf enseña a lidiar con la frustración y a aceptar que, como en la vida, no todo siempre sale como uno espera. Cada golpe malo es una oportunidad de aprender, de levantarse y de seguir adelante, reforzando la resiliencia y la capacidad de superar obstáculos.</p></article>
          <article className="value" data-reveal><span className="leaf">05</span><h3 className="label">Estrategia</h3><p>Por otro lado, el golf es un deporte de estrategia, donde cada decisión cuenta y cada golpe tiene consecuencias. Esto forma en los jóvenes la capacidad de pensar antes de actuar, de analizar riesgos y tomar decisiones con cabeza fría, habilidades cruciales para la vida personal y profesional.</p></article>
          <article className="value" data-reveal><span className="leaf">06</span><h3 className="label">Comunidad</h3><p>El entorno social que se genera es único, donde se comparten momentos, se crean amistades y se generan redes que pueden ser valiosas a lo largo de los años. La combinación de deporte, naturaleza, valores y relaciones hace del golf una actividad que educa para la vida.</p></article>
        </div>
        <ScrollHighlight
          as="blockquote"
          className="quote"
          text="Son pocas las academias que reúnen a un profesional con tanta versatilidad y experiencia para que todos puedan dar sus primeros pasos en el Golf, o se acerquen a perfeccionarse y dar un salto en su nivel deportivo."
        />
      </div>
    </section>
  );
}
