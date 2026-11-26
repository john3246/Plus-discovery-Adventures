// Page controllers for tours, destinations and accommodation (sample-data backed).
import { getSnapshot, getItinerary } from '../store.js';
import { INCLUDED, EXCLUDED, INCLUDED_TREK, EXCLUDED_TREK } from '../../data/buildItinerary.js';
import { guides } from '../guides.js';
import { destinationSlides } from '../../data/destinationSlides.js';
import { createLinker } from '../internalLinks.js';
import * as seo from '../seo.js';
import { unsplash } from '../../data/images.js';
import { STYLE_FILTERS, CATEGORY_FILTERS, matchesStyle } from '../../data/filters.js';


const CATEGORY_PAGES = {
  safaris: { category: 'safari', title: 'Tanzania Safaris', intro: 'Camping, mid-range and luxury safaris across the northern and southern circuits.' },
  kilimanjaro: { category: 'kilimanjaro', title: 'Kilimanjaro Climbs', intro: 'Mount Kilimanjaro climbs, Mount Meru and Tanzania\'s volcano and highland treks, with experienced mountain guides.' },
  'day-trips': { category: 'day-trip', title: 'Day Trips from Arusha', intro: 'Short adventures with a night in your own bed.' },
  zanzibar: { category: 'zanzibar', title: 'Zanzibar Beach Holidays', intro: 'White sand, spice tours and Stone Town.' },
};

const DURATION = { short: [1, 3], medium: [4, 6], long: [7, 99] };
const SORTS = { popular: () => 0, price: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity), duration: (a, b) => a.days - b.days };

function applyFilters(list, q) {
  let out = list;
  if (q.style) out = out.filter((t) => matchesStyle(t, q.style));
  if (DURATION[q.duration]) out = out.filter((t) => t.days >= DURATION[q.duration][0] && t.days <= DURATION[q.duration][1]);
  if (Number(q.maxPrice)) out = out.filter((t) => t.price != null && t.price <= Number(q.maxPrice));
  return [...out].sort(SORTS[q.sort] ?? SORTS.popular);
}

/** View model for the filter sidebar and results: category and style options carry live trip counts. */
function listing(tours, query, fallbackCategory) {
  const category = CATEGORY_FILTERS.some(([k]) => k === query.category) ? query.category : fallbackCategory;
  const inCategory = (c) => (c === 'all' ? tours : tours.filter((t) => t.category === c));
  const pool = inCategory(category);
  return {
    items: applyFilters(pool, query), query, category, total: pool.length,
    categories: CATEGORY_FILTERS.map(([key, label]) => ({ key, label, count: inCategory(key).length })),
    styles: STYLE_FILTERS.map(([key, label]) => ({ key, label, count: pool.filter((t) => matchesStyle(t, key)).length })),
  };
}

export function categoryPage(key) {
  const meta = CATEGORY_PAGES[key];
  return async (req, res) => {
    const { tours } = await getSnapshot();
    res.render('pages/tours/list.njk', { ...meta, ...listing(tours, req.query, meta.category), basePath: `/${res.locals.lang}/${key}` });
  };
}

export async function allToursPage(req, res) {
  const { tours } = await getSnapshot();
  res.render('pages/tours/list.njk', { title: 'All Tours & Safaris', intro: 'Every trip we run, in one place.', ...listing(tours, req.query, 'all'), basePath: `/${res.locals.lang}/tours` });
}

export async function tourPage(req, res, next) {
  const { tours, destinations, reviews } = await getSnapshot();
  const tour = tours.find((t) => t.slug === req.params.slug);
  if (!tour) return next();
  const related = tours.filter((t) => t.category === tour.category && t.slug !== tour.slug).slice(0, 3);
  const path = `/${res.locals.lang}/tours/${tour.slug}`;
  res.locals.schemas.push(seo.tourSchema(tour, path, unsplash(tour.image, 1200, 630)),
    seo.breadcrumbs([['Home', `/${res.locals.lang}`], ['Tours', `/${res.locals.lang}/tours`], [tour.title, path]]));
  const { posts } = await getSnapshot();
  const topic = tour.category === 'kilimanjaro' ? /kilimanjaro/i : /migration|best-time|pack/i;
  res.render('pages/tours/show.njk', {
    link: createLinker(res.locals.lang), reading: posts.filter((x) => topic.test(x.slug)).slice(0, 3),
    guideStops: tour.stops.filter((s) => guides[s]),
    tour, related, reviews, included: tour.category === 'kilimanjaro' ? INCLUDED_TREK : INCLUDED, excluded: tour.category === 'kilimanjaro' ? EXCLUDED_TREK : EXCLUDED,
    itinerary: await getItinerary(tour), stops: tour.stops.map((s) => destinations.find((d) => d.slug === s)).filter(Boolean),
  });
}

export async function destinationsPage(req, res) {
  const { destinations } = await getSnapshot();
  const slides = destinations.map((d) => ({ image: d.image, alt: d.name, label: d.name, url: `/${res.locals.lang}/destinations/${d.slug}` }));
  res.render('pages/destinations/list.njk', { items: destinations, slides, words: destinations.map((d) => d.name) });
}

export async function destinationPage(req, res, next) {
  const { tours, destinations, accommodations } = await getSnapshot();
  const destination = destinations.find((d) => d.slug === req.params.slug);
  if (!destination) return next();
  const guide = guides[destination.slug] ?? null;
  const path = `/${res.locals.lang}/destinations/${destination.slug}`;
  res.locals.schemas.push(seo.destinationSchema(destination, guide, path, unsplash(destination.image, 1200, 630)),
    seo.breadcrumbs([['Home', `/${res.locals.lang}`], ['Destinations', `/${res.locals.lang}/destinations`], [destination.name, path]]));
  if (guide?.faqs.length) res.locals.schemas.push(seo.faqSchema(guide.faqs));
  const own = destinationSlides[destination.slug];
  const images = [...new Set([...(own?.images ?? []), destination.image])].filter(Boolean);
  const visiting = tours.filter((t) => t.stops.includes(destination.slug));
  const prices = visiting.map((t) => t.price).filter((x) => x != null);
  res.render('pages/destinations/show.njk', {
    slides: images.map((image, i) => ({ image, alt: `${destination.name}, photo ${i + 1}` })),
    words: own?.words ?? destination.highlights ?? [],
    tripCount: visiting.length, fromPrice: prices.length ? Math.min(...prices) : null,
    destination, guide, guideLinks: destinations.filter((d) => guides[d.slug]),
    related: [...tours.filter((t) => t.stops.includes(destination.slug)), ...tours.filter((t) => t.featured)].filter((t, i, a) => a.indexOf(t) === i).slice(0, 3),
    stays: [...accommodations.filter((a) => a.destination === destination.slug), ...accommodations].filter((a, i, arr) => arr.indexOf(a) === i).slice(0, 3),
    others: destinations.filter((d) => d.slug !== destination.slug).slice(0, 4),
  });
}

export const accommodationsPage = async (req, res) => {
  const { accommodations } = await getSnapshot();
  const items = req.query.tier ? accommodations.filter((a) => a.tier === req.query.tier) : accommodations;
  res.render('pages/accommodations/list.njk', { items, query: req.query });
};

export async function accommodationPage(req, res, next) {
  const { accommodations, destinations } = await getSnapshot();
  const stay = accommodations.find((a) => a.slug === req.params.slug);
  if (!stay) return next();
  res.render('pages/accommodations/show.njk', { stay, destination: destinations.find((d) => d.slug === stay.destination) });
}
