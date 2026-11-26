import { IMG } from './images.js';

// category: safari | kilimanjaro | day-trip | zanzibar
// style: joining | camping | mid-range | luxury | migration | honeymoon | trek | cultural | beach
import { readFileSync } from 'node:fs';
import { destinations } from './destinations.js';
import { draftPackages } from './draftPackages.js';

const STYLE_TAG = { camping: ['Budget', 'rose'], 'mid-range': ['Mid Range', 'rose'], luxury: ['Luxury', 'amber'], joining: ['Group Joining', 'sky'],
  migration: ['Great Migration', 'emerald'], honeymoon: ['Honeymoon', 'pink'], classic: ['Safari', 'rose'], trek: ['Trekking', 'emerald'], cultural: ['Cultural', 'amber'], beach: ['Beach', 'sky'] };
const STAY_TAG = { camping: 'Camping', 'mid-range': 'Lodge', luxury: 'Luxury Camp', joining: 'Lodge', migration: 'Lodge', honeymoon: 'Resort', classic: 'Per itinerary', trek: 'Mountain Huts', cultural: 'Day Trip', beach: 'Beach Resort' };
const shortName = (n) => n.replace(/ (National Park|Conservation Area|Archipelago)$/, '').replace(/^Mount /, 'Mt ').replace(/ \(Selous\)/, '');


/** Builds the view model for a tour (tags, route labels). Used by the bundled packages and the database store. */
export function buildTour({ slug, title, category, style, days, price, image, stops, summary, rating, reviews, featured = false, id = null, status = 'published', ...extra }) {
  const visit = stops.map((s, i) => ({ name: shortName(destinations.find((d) => d.slug === s)?.name ?? s.replace(/-/g, ' ')),
    mark: stops.length > 1 && i === 0 ? 'Start' : stops.length > 1 && i === stops.length - 1 ? 'End' : '' }));
  return { id, slug, title, category, style, days, price: price ?? null, image, stops, summary, visit, status,
    nights: Math.max(days - 1, 0), currency: 'USD', featured, rating: rating ?? null, reviews: reviews ?? null, ...extra,
    tags: ['Tanzania', style === 'joining' ? 'Group' : 'Private', STYLE_TAG[style] ?? [style, 'rose'], STAY_TAG[style] ?? 'Lodge'] };
}


const IMAGE_BY_NAME = IMG;
const firstSentences = (paras, max = 190) => {
  const text = (paras ?? []).join(' ');
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = '';
  for (const sentence of sentences) { if ((out + sentence).length > max && out) break; out += sentence; }
  return out.trim();
};

// Fully written packages (itinerary, overview, prices): src/data/packages.json
const packages = JSON.parse(readFileSync(new URL('./packages.json', import.meta.url), 'utf8')).map((p) => buildTour({
  slug: p.slug, title: p.title, category: p.category, style: p.style, days: p.days, price: p.price, image: IMAGE_BY_NAME[p.image] ?? IMG.jeep,
  stops: p.stops, summary: firstSentences(p.overview), featured: p.featured,
  overview: p.overview, highlights: p.highlights, bestTime: p.bestTime, itinerary: p.itinerary, tiers: p.tiers,
}));

const drafts = draftPackages.filter((d) => !packages.some((p) => p.slug === d.slug)).map((d) => buildTour({ ...d, itinerary: [] }));

export const tours = [...packages, ...drafts];

export const findTour = (slug) => tours.find((x) => x.slug === slug);
export const toursByCategory = (c) => tours.filter((x) => x.category === c);
