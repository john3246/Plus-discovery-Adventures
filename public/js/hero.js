// Slideshow hero: crossfading photos, previous/pause/next controls and changing words.
import { scrambleTo } from './scramble.js';

const SLIDE_MS = 5000;
const WORD_MS = 3200;

function cycleWords(el) {
  const words = el.dataset.words.split('|');
  let word = 0;
  scrambleTo(el, words[0]);
  setInterval(() => {
    word = (word + 1) % words.length;
    scrambleTo(el, words[word]);
  }, WORD_MS);
}

function slideshow(hero, still) {
  const slides = [...hero.querySelectorAll('[data-slide]')];
  const word = hero.querySelector('[data-word]');
  const pause = hero.querySelector('[data-pause]');
  const follows = Boolean(slides[0]?.dataset.label);
  let current = 0;
  let timer = null;
  let paused = still;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.setAttribute('aria-label', `Show photo ${i + 1}`);
    dot.addEventListener('click', () => show(i));
    hero.querySelector('[data-dots]').append(dot);
    return dot;
  });

  function show(i) {
    current = (i + slides.length) % slides.length;
    // Fetch this photo and the next one now, so the crossfade never fades to an empty frame.
    [current, (current + 1) % slides.length].forEach((n) => { slides[n].loading = 'eager'; });
    slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
    dots.forEach((d, n) => d.setAttribute('aria-current', String(n === current)));
    if (follows && word) {
      scrambleTo(word, slides[current].dataset.label);
      word.href = slides[current].dataset.url;
      word.removeAttribute('aria-hidden');
    }
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused) timer = setTimeout(() => show(current + 1), SLIDE_MS);
  }
  function setPaused(value) {
    paused = value;
    pause.setAttribute('aria-pressed', String(value));
    pause.setAttribute('aria-label', value ? 'Play slideshow' : 'Pause slideshow');
    pause.textContent = value ? '▶' : '❚❚';
    schedule();
  }

  hero.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
  hero.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
  pause.addEventListener('click', () => setPaused(!paused));
  show(0);
  setPaused(paused);
  if (word && !follows && !still) cycleWords(word);
}

export function initHero() {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-hero]').forEach((hero) => slideshow(hero, still));
}
