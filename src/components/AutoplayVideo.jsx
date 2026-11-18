import { useEffect, useRef } from 'react';

// Muted, looping background clip that starts on its own on phones too.
// - React doesn't reliably set the `muted` attribute, which iOS needs for autoplay, so it's set by hand.
// - iOS Low Power Mode and Android data savers block autoplay until the visitor touches the page:
//   the clip retries on the first touch.
// - It plays while on screen and pauses off screen (saves battery and data).
export default function AutoplayVideo(props) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');

    let onScreen = true;
    const tryPlay = () => { if (onScreen && el.paused) el.play()?.catch(() => {}); };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) tryPlay(); else el.pause();
    }, { rootMargin: '200px 0px' });
    io.observe(el);

    const kick = () => tryPlay();
    const gestures = ['touchend', 'click', 'keydown'];
    gestures.forEach((g) => window.addEventListener(g, kick, { passive: true }));
    // once playback has really started, the retries aren't needed
    const started = () => gestures.forEach((g) => window.removeEventListener(g, kick));
    el.addEventListener('playing', started, { once: true });
    el.addEventListener('canplay', tryPlay);
    tryPlay();

    return () => {
      io.disconnect();
      started();
      el.removeEventListener('playing', started);
      el.removeEventListener('canplay', tryPlay);
    };
  }, []);

  return <video ref={ref} autoPlay muted loop playsInline disablePictureInPicture tabIndex={-1} {...props} />;
}
