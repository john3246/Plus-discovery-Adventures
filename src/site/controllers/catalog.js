// Page controllers for tours, destinations and accommodation (sample-data backed).
import { getSnapshot, getItinerary } from '../store.js';
import { INCLUDED, EXCLUDED } from '../../data/buildItinerary.js';
import { tourStyles } from '../../data/site.js';

const CATEGORY_PAGES = {
  safaris: { category: 'safari', title: 'Tanzania Safaris', intro: 'Camping, mid-range and luxury safaris across the northern and southern circuits.' },
  kilimanjaro: { category: 'kilimanjaro', title: 'Kilimanjaro Climbs', intro: 'Choose your route to the roof of Africa, from 6 to 9 days.' },
  'day-trips': { category: 'day-trip', title: 'Day Trips from Arusha', intro: 'Short adventures with a night in your own bed.' },
  zanzibar: { category: 'zanzibar', title: 'Zanzibar Beach Holidays', intro: 'White sand, spice tours and Stone Town.' },
};

const DURATION = { short: [1, 3], medium: [4, 6], long: [7, 99] };
const SORTS = { popular: () => 0, price: (a, b) => a.price - b.price, duration: (a, b) => a.days - b.days };

function applyFilters(list, q) {
  let out = list;
  if (q.style) out = out.filter((t) => t.style === q.style);
  if (DURATION[q.duration]) out = out.filter((t) => t.days >= DURATION[q.duration][0] && t.days <= DURATION[q.duration][1]);
  if (Number(q.maxPrice)) out = out.filter((t) => t.price <= Number(q.maxPrice));
  return [...out].sort(SORTS[q.sort] ?? SORTS.popular);
}

export function categoryPage(key) {
  const meta = CATEGORY_PAGES[key];
  return async (req, res) => {
    const { tours } = await getSnapshot();
    const items = applyFilters(tours.filter((t) => t.category === meta.category), req.query);
    res.render('pages/tours/list.njk', { ...meta, items, query: req.query, styles: tourStyles, basePath: `/${res.locals.lang}/${key}` });
  };
}

export async function allToursPage(req, res) {
  const { tours } = await getSnapshot();
  const items = applyFilters(tours, req.query);
  res.render('pages/tours/list.njk', { title: 'All Tours & Safaris', intro: 'Every trip we run, in one place.', items, query: req.query, styles: tourStyles, basePath: `/${res.locals.lang}/tours` });
}

export async function tourPage(req, res, next) {
  const { tours, destinations, reviews } = await getSnapshot();
  const tour = tours.find((t) => t.slug === req.params.slug);
  if (!tour) return next();
  const related = tours.filter((t) => t.category === tour.category && t.slug !== tour.slug).slice(0, 3);
  res.render('pages/tours/show.njk', {
    tour, related, reviews, included: INCLUDED, excluded: EXCLUDED,
    itinerary: await getItinerary(tour), stops: tour.stops.map((s) => destinations.find((d) => d.slug === s)).filter(Boolean),
  });
}

export async function destinationsPage(req, res) {
  res.render('pages/destinations/list.njk', { items: (await getSnapshot()).destinations });
}

export async function destinationPage(req, res, next) {
  const { tours, destinations, accommodations } = await getSnapshot();
  const destination = destinations.find((d) => d.slug === req.params.slug);
  if (!destination) return next();
  res.render('pages/destinations/show.njk', {
    destination,
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
