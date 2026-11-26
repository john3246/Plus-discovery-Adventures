// Highlights the guide section currently being read in the contents list.
export function initToc() {
  const links = [...document.querySelectorAll('.toc a')];
  const headings = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (!headings.length) return;
  const update = () => {
    const current = headings.filter((h) => h.getBoundingClientRect().top < 200).pop() ?? headings[0];
    links.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${current.id}`)));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}
