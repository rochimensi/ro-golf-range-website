import Gallery from '../components/Gallery.jsx';

// Title on the left that stays put (sticky) while the photo grid scrolls past on the right.
// The grid runs out to 40px from the right edge of the screen (see .gal-layout).
export default function Galeria() {
  return (
    <section id="galeria" className="vs green" data-sec={250}>
      <div className="gal-layout">
        <header className="gal-head" data-reveal>
          <h2 className="display-l">El range en fotos</h2>
        </header>
        <Gallery />
      </div>
    </section>
  );
}
