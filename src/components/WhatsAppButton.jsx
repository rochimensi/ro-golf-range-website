import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { inRange } from './YardageNav.jsx';

// Floating WhatsApp button, bottom right. Hidden over the putt intro; it slides in once Canastos is on
// screen (the same moment as the yardage rail) and stays for the rest of the page, on phones too.
export const WHATSAPP = 'https://wa.me/5491159841197';

export default function WhatsAppButton() {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    const sync = (st) => el.classList.toggle('on', inRange(st));
    ScrollTrigger.create({
      trigger: document.getElementById('canastos'),
      endTrigger: document.getElementById('v'),
      start: 'top bottom',
      end: 'bottom top',
      onToggle: sync,
      onRefresh: sync,
      refreshPriority: -1, // measure after the pinned sections add their scroll space
    });
  }, { scope: ref });

  return (
    <a ref={ref} id="wa-fab" href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="Escribinos por WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
        <path d="M9 9.5c.3 2 2.3 4.4 5 5l1.2-1.2 2 1-.6 1.6c-3.6.4-8.4-3.6-8.4-8l1.6-.6 1 2z" />
      </svg>
    </a>
  );
}
