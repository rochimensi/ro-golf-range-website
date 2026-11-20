// Tiny path router: the home page plus two pages of their own, /academia and /omar-peralta.
// Real paths (not #hashes) so Google indexes each page separately; the build writes an index.html for each (vite.config.js).
// Section anchors on the home page (#canastos, #contacto…) are handled by Lenis and never change the route.
export const ROUTE_EVENT = 'ro:route';

const PAGES = { academia: '/academia', omar: '/omar-peralta' };
// Old hash links (shared before the switch to paths) → the new path, see main.jsx.
export const LEGACY_HASHES = { '#academia': PAGES.academia, '#acerca-de-omar': PAGES.omar };

// Home page scroll position when the visitor left it, so coming back lands in the same place.
export const homeScroll = { y: null };

const path = () => location.pathname.replace(/\/+$/, '') || '/';
export const currentRoute = () => Object.keys(PAGES).find((k) => PAGES[k] === path()) || 'home';

const base = () => `/${location.search}`;

export function navigate(to) {
  const from = currentRoute();
  if (to === from) return;
  if (to === 'home') {
    // came from the home page: just go back in history (popstate re-renders)
    if (history.state?.fromHome) { history.back(); return; }
    history.pushState(null, '', base());
  } else if (from === 'home') {
    // remember we left the home page, so "Volver" can simply go back
    history.pushState({ fromHome: true }, '', PAGES[to] + location.search);
  } else {
    // page → page (e.g. bio → Academia): swap in place, so "Volver" still returns to the home page
    history.replaceState(history.state, '', PAGES[to] + location.search);
  }
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

// Props for an <a> that switches page: a real href (opens in a new tab with ⌘/Ctrl-click),
// a normal click navigates in place. stopPropagation keeps Lenis' anchor handler out of it.
export function linkTo(to) {
  return {
    href: to === 'home' ? base() : PAGES[to] + location.search,
    onClick: (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      navigate(to);
    },
  };
}
