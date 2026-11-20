import { useEffect, useRef } from 'react';

// Muted, looping background clip that starts on its own on phones too.
// - React doesn't reliably set the `muted` attribute, which iOS needs for autoplay, so it's set by hand.
// - iOS Low Power Mode and Android data savers block autoplay until the visitor touches the page:
//   the clip retries on the first touch.
// - It plays while on screen and pauses off screen (saves battery and data).
// - `lazy`: the file isn't requested at all until the clip comes within about half a screen of view
//   (only the poster shows until then).
// - iOS only lets a video start by itself after it has been played once from a tap (scrolling doesn't count).
//   So the first tap anywhere unlocks every clip on the page at once, including lazy ones further down
//   (they start loading then), not just the ones on screen; before, each clip needed a tap of its own.

const clips = new Set();   // clips iOS hasn't let play yet: their unlock functions
const gestures = ['touchend', 'click', 'keydown'];
// A touchend that ends a scroll isn't a tap, so play() is refused then: a clip stays in the set until it really
// plays, and the listeners stay on (clips on a page opened later need their own tap too).
// Only when autoplay was actually refused (Low Power Mode, "Auto-Play Video Previews" off): elsewhere clips
// play by themselves and a click must not load every clip on the page. navigator.userActivation tells a real
// tap from the end of a scroll, so a scroll doesn't start downloads that would be refused anyway.
let blocked = false;
const unlockAll = () => {
  if (!blocked || navigator.userActivation?.isActive === false) return;
  clips.forEach((unlock) => unlock());
};
// Attached by the first clip that mounts, not when this file loads: the build prerenders the pages in Node,
// where `window` is only a stand-in without addEventListener.
let listening = false;
function listenForTaps() {
  if (listening) return;
  listening = true;
  gestures.forEach((g) => window.addEventListener(g, unlockAll, { passive: true }));
}

export default function AutoplayVideo({ lazy = false, src, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');

    let onScreen = !lazy;
    const tryPlay = () => {
      if (onScreen && el.paused && el.getAttribute('src')) el.play()?.catch((e) => { if (e?.name === 'NotAllowedError') blocked = true; });
    };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && lazy && !el.getAttribute('src')) el.src = src;
      if (onScreen) tryPlay(); else el.pause();
    }, { rootMargin: lazy ? '50% 0px' : '200px 0px' });
    io.observe(el);

    // Called inside the tap (iOS needs that): play once, which unlocks this clip for good, then pause again
    // if it's off screen; from then on it plays by itself whenever it scrolls into view.
    const unlock = () => {
      if (!el.getAttribute('src')) el.src = src;
      const p = el.play();
      if (!p) return;
      p.then(() => {
        clips.delete(unlock);
        if (!onScreen) el.pause();
      }).catch(() => {});
    };
    clips.add(unlock);
    listenForTaps();
    el.addEventListener('canplay', tryPlay);
    tryPlay();

    return () => {
      io.disconnect();
      clips.delete(unlock);
      el.removeEventListener('canplay', tryPlay);
    };
  }, [lazy, src]);

  return (
    <video ref={ref} autoPlay muted loop playsInline disablePictureInPicture tabIndex={-1} {...props}
      src={lazy ? undefined : src} preload={lazy ? 'none' : props.preload} />
  );
}
