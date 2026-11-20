// Tiny hash router: the home page plus two pages of their own, #academia and #acerca-de-omar.
// Section anchors on the home page (#canastos, #contacto…) are handled by Lenis and never change the route.
export const ROUTE_EVENT = 'ro:route';

const PAGES = { academia: '#academia', omar: '#acerca-de-omar' };

// Home page scroll position when the visitor left it, so coming back lands in the same place.
export const homeScroll = { y: null };

export const isPageHash = (hash) => Object.values(PAGES).includes(hash);
export const currentRoute = () => Object.keys(PAGES).find((k) => PAGES[k] === location.hash) || 'home';

const base = () => `${location.pathname}${location.search}`;

export function navigate(to) {
  const from = currentRoute();
  if (to === from) return;
  if (to === 'home') {
    // came from the home page: just go back in history (popstate re-renders)
    if (history.state?.fromHome) { history.back(); return; }
    history.pushState(null, '', base());
  } else if (from === 'home') {
    // remember we left the home page, so "Volver" can simply go back
    history.pushState({ fromHome: true }, '', base() + PAGES[to]);
  } else {
    // page → page (e.g. bio → Academia): swap in place, so "Volver" still returns to the home page
    history.replaceState(history.state, '', base() + PAGES[to]);
  }
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

// Props for an <a> that switches page: a real href (opens in a new tab with ⌘/Ctrl-click),
// a normal click navigates in place. stopPropagation keeps Lenis' anchor handler out of it.
export function linkTo(to) {
  return {
    href: to === 'home' ? base() : PAGES[to],
    onClick: (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      navigate(to);
    },
  };
}
