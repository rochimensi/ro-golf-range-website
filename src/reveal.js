// Shared by every page: reveal [data-reveal] elements as they scroll into view (CSS handles the motion),
// and show a labelled placeholder for photos that aren't supplied yet (img[data-fallback]).
export function setupReveal(root) {
  // An IntersectionObserver also catches elements already on screen after a jump (anchor links,
  // reloading partway down the page).
  const revealIO = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting)
      .forEach((e, i) => {
        setTimeout(() => e.target.classList.add('in'), i * 70);
        revealIO.unobserve(e.target);
      });
  }, { rootMargin: '0px 0px -12% 0px' });
  const REVEAL = '[data-reveal]';   // gallery photos reveal themselves once loaded (Gallery.jsx)
  root.querySelectorAll(REVEAL).forEach((el) => revealIO.observe(el));
  // Elements added later (a section re-rendered by hot reload while editing, or content that mounts
  // after load) would otherwise stay hidden at opacity 0: watch for them too.
  const revealMO = new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches(REVEAL) && !n.classList.contains('in')) revealIO.observe(n);
      n.querySelectorAll(REVEAL).forEach((el) => { if (!el.classList.contains('in')) revealIO.observe(el); });
    }));
  });
  revealMO.observe(root, { childList: true, subtree: true });

  const markMissing = (img) => img.parentElement.classList.add('missing');
  root.querySelectorAll('img[data-fallback]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    else img.addEventListener('error', () => markMissing(img), { once: true });
  });

  return () => { revealIO.disconnect(); revealMO.disconnect(); };
}
