// Mobile menu toggle.
export function initNav() {
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', String(open));
  });
}
