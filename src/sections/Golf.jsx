import ScrollHighlight from '../components/ScrollHighlight.jsx';
import ValuesMarquee from '../components/ValuesMarquee.jsx';

const VALUES = [
  ['Disciplina', 'El golf es un deporte que exige disciplina, paciencia, autocontrol y una profunda capacidad de concentración, cualidades esenciales para afrontar los desafíos de la vida adulta.'],
  ['Honestidad', 'Desde muy temprana edad, el golf enseña el valor de la honestidad, ya que es uno de los pocos deportes donde cada jugador es su propio árbitro. Ser honesto con uno mismo y reconocer errores sin que nadie lo exija, es una lección que trasciende el campo de juego y prepara a los jóvenes para actuar con integridad en cualquier ámbito.'],
  ['Respeto', 'El respeto es otro pilar fundamental del golf: respeto por las reglas, por el compañero, por el campo y por el propio juego. En la vida, aprender a respetar a los demás y a uno mismo abre puertas y construye relaciones sanas y duraderas.'],
  ['Resiliencia', 'Además, el golf enseña a lidiar con la frustración y a aceptar que, como en la vida, no todo siempre sale como uno espera. Cada golpe malo es una oportunidad de aprender, de levantarse y de seguir adelante, reforzando la resiliencia y la capacidad de superar obstáculos.'],
  ['Estrategia', 'Por otro lado, el golf es un deporte de estrategia, donde cada decisión cuenta y cada golpe tiene consecuencias. Esto forma en los jóvenes la capacidad de pensar antes de actuar, de analizar riesgos y tomar decisiones con cabeza fría, habilidades cruciales para la vida personal y profesional.'],
  ['Comunidad', 'El entorno social que se genera es único, donde se comparten momentos, se crean amistades y se generan redes que pueden ser valiosas a lo largo de los años. La combinación de deporte, naturaleza, valores y relaciones hace del golf una actividad que educa para la vida.'],
];

export default function Golf() {
  return (
    <section id="golf" className="vs cream" data-sec={50}>
      <div className="wrap">
        <header className="vh center" data-reveal>
          <h2 className="display-l">El GOLF es una escuela de vida</h2>
          <div className="rule mx" />
          <p className="body-l">Los valores y enseñanzas que te acompañarán a lo largo de la vida.</p>
        </header>
      </div>
      {/* full width, outside the wrap */}
      <ValuesMarquee values={VALUES} />
      <div className="wrap">
        <ScrollHighlight
          as="blockquote"
          className="quote"
          text="Son pocas las academias que reúnen a un profesional con tanta versatilidad y experiencia para que todos puedan dar sus primeros pasos en el Golf, o se acerquen a perfeccionarse y dar un salto en su nivel deportivo."
        />
        <div className="center-btn" data-reveal>
          <a className="btn academia" href="#omar">Ver Academia Omar Peralta</a>
        </div>
      </div>
    </section>
  );
}
