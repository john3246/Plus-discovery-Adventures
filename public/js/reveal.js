// Scroll animation: blocks below the screen rise and fade in as the visitor reaches them.
// Content is only hidden by this script, so the page stays fully readable without JavaScript.
const TARGETS = [
  'main .section .container-x > *', 'main .section .grid > *', 'main section > .container-x.grid > div',
  'main #itinerary .tl-item', 'main .guide > h2', 'main .guide-table',
].join(',');
const STAGGER_MS = 90;

export function initReveal() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Sticky panels stay as they are; where blocks are nested, only the innermost one animates.
  const found = [...document.querySelectorAll(TARGETS)].filter((el) => !el.matches('form[aria-label="Filter trips"], aside, nav'));
  const targets = found.filter((el) => !found.some((other) => other !== el && el.contains(other)))
    .filter((el) => el.getBoundingClientRect().top > innerHeight * 0.9);

  const observer = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((entry, order) => {
      const el = entry.target;
      const delay = Math.min(order, 5) * STAGGER_MS;
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add('is-visible');
      observer.unobserve(el);
      // Hand the element back to its own styles (hover effects) once it has arrived.
      setTimeout(() => { el.classList.remove('reveal', 'is-visible'); el.style.transitionDelay = ''; }, delay + 800);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => { el.classList.add('reveal'); observer.observe(el); });
}
