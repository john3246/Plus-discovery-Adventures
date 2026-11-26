// ScrambleText effect: random characters resolve into the real words from left to right.
// Narrow-ish letters, matched to the case of the real one, so scrambled words stay close to their final width.
const LOWER = 'abcdeghknopqrsuvxyz';
const UPPER = 'ABCEFHKNPRSTVXYZ';
const running = new WeakMap();
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const glyph = (like) => {
  const set = like === like.toUpperCase() && like !== like.toLowerCase() ? UPPER : LOWER;
  return set[Math.floor(Math.random() * set.length)];
};

/** Calls draw(revealedCount) until every character is revealed. A newer run on the same key replaces this one. */
function run(key, length, duration, draw) {
  clearInterval(running.get(key));
  const start = performance.now();
  const step = () => {
    const progress = Math.min((performance.now() - start) / duration, 1);
    draw(Math.floor(progress * length));
    if (progress === 1) clearInterval(running.get(key));
  };
  running.set(key, setInterval(step, 40));
  step();
}

const mix = (text, revealed) => [...text].map((c, i) => (i < revealed || !/[a-z0-9]/i.test(c) ? c : glyph(c))).join('');

/** Scrambles a short phrase into an element. */
export function scrambleTo(el, text, duration = 900) {
  if (still()) { el.textContent = text; return; }
  run(el, text.length, duration, (revealed) => { el.textContent = mix(text, revealed); });
}

/**
 * Scrambles a headline in place. Each word keeps an invisible copy of itself so lines never jump,
 * and screen readers are given the real sentence.
 */
export function scrambleHeading(el, duration = 1600, delay = 0) {
  if (still()) return;
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  const label = document.createElement('span');
  label.className = 'sr-only';
  label.textContent = text;
  let offset = 0;
  const words = text.split(' ').map((word) => {
    const box = document.createElement('span');
    box.className = 'scramble-word';
    box.setAttribute('aria-hidden', 'true');
    const size = document.createElement('span');
    size.className = 'scramble-size';
    size.textContent = word;
    const shown = document.createElement('span');
    shown.className = 'scramble-show';
    box.append(size, shown);
    const item = { box, shown, word, offset };
    offset += word.length + 1;
    return item;
  });
  el.replaceChildren(label, ...words.flatMap((w) => [w.box, ' ']));
  const draw = (revealed) => words.forEach((w) => { w.shown.textContent = mix(w.word, revealed - w.offset); });
  draw(0);
  setTimeout(() => run(el, text.length, duration, draw), delay);
}

export function initScramble() {
  document.querySelectorAll('[data-scramble]').forEach((el) => scrambleHeading(el, 1600, Number(el.dataset.scramble) || 0));
}
