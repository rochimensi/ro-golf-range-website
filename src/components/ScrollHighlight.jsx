import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Text whose words brighten one after another as you scroll: each word starts at 60% opacity
// and reaches 100% as the passage moves up the screen. Reduced motion shows it at full opacity.
export default function ScrollHighlight({ as: Tag = 'p', text, className = '' }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = ref.current.querySelectorAll('.hw');
    gsap.fromTo(words, { opacity: 0.6 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 },
    });
  }, { scope: ref });

  const words = text.trim().split(/\s+/);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="hw">{w}</span>{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
