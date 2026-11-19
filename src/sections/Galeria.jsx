import Gallery from '../components/Gallery.jsx';
export default function Galeria() {
  return (
    <section id="galeria" className="vs green" data-sec={250}>
      <div className="wrap">
        <header className="vh" data-reveal>
          <div className="label">250 yd · Galería</div>
          <h2 className="display-l">El range en fotos y videos</h2>
          <div className="rule" />
        </header>
        <Gallery />
      </div>
    </section>
  );
}
