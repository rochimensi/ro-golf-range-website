import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { inRange } from './YardageNav.jsx';
import { linkTo } from '../route.js';

// Small tab on the right edge, vertically centred: a quiet, always-there way into the Academia page.
// Hidden over the putt intro; it slides in once Canastos is on screen (with the yardage rail and the
// WhatsApp button) and stays for the rest of the page. Hover/focus: it turns gold and pulls out a little.
export default function AcademiaTab() {
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
    <a ref={ref} id="ac-tab" {...linkTo('academia')} aria-label="Academia Omar Peralta">
      <span className="act-txt" aria-hidden="true">Academia</span>
    </a>
  );
}
