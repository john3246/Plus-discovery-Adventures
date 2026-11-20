// Page controllers for home, blog, gallery, search and static pages.
import { tours, toursByCategory } from '../../data/tours.js';
import { destinations } from '../../data/destinations.js';
import { posts, findPost, reviews, gallery, faqs, accommodations } from '../../data/content.js';
import { whyUs, steps, tourStyles } from '../../data/site.js';

function destinationStats(d) {
  const prices = tours.filter((t) => t.stops.includes(d.slug)).map((t) => t.price);
  return { ...d, count: prices.length, from: prices.length ? Math.min(...prices) : null, to: prices.length ? Math.max(...prices) : null };
}

export function homePage(req, res) {
  res.render('pages/home.njk', {
    featured: tours.filter((t) => t.featured),
    byStyle: Object.fromEntries(['camping', 'mid-range', 'luxury', 'migration'].map((s) => [s, tours.filter((t) => t.style === s && t.category === 'safari').slice(0, 3)])),
    climbs: toursByCategory('kilimanjaro').slice(0, 3),
    dayTrips: toursByCategory('day-trip').slice(0, 3),
    zanzibarTrips: toursByCategory('zanzibar').slice(0, 3),
    destinations: destinations.slice(0, 8),
    popular: ['serengeti', 'ngorongoro', 'tarangire', 'zanzibar'].map((s) => destinationStats(destinations.find((d) => d.slug === s))),
    stays: accommodations.slice(0, 3), faqs: faqs.slice(0, 4), steps,
    stats: [[tours.length, 'Trips to choose from'], [destinations.length, 'Destinations'], [accommodations.length, 'Handpicked stays'], ['1', 'Planner per trip']],
    posts: posts.slice(0, 3), reviews, whyUs,
    styles: tourStyles.concat([['migration', 'Great Migration', 'Follow the herds across the Serengeti.']]),
  });
}

export const blogPage = (req, res) => {
  const items = req.params.category ? posts.filter((p) => p.category.toLowerCase().replace(/ /g, '-') === req.params.category) : posts;
  res.render('pages/blog/list.njk', { items, categories: [...new Set(posts.map((p) => p.category))] });
};

export function blogPostPage(req, res, next) {
  const post = findPost(req.params.slug);
  if (!post) return next();
  res.render('pages/blog/show.njk', { post, related: posts.filter((p) => p.slug !== post.slug).slice(0, 3) });
}

export const galleryPage = (req, res) => res.render('pages/gallery.njk', { images: gallery });
export const reviewsPage = (req, res) => res.render('pages/reviews.njk', { reviews });
export const faqsPage = (req, res) => res.render('pages/faqs.njk', { faqs });
export const aboutPage = (req, res) => res.render('pages/about.njk', { whyUs, steps });
export const travelGuidePage = (req, res) => res.render('pages/travelGuide.njk', { destinations, posts });

export function searchPage(req, res) {
  const q = String(req.query.q ?? '').trim().toLowerCase().slice(0, 80);
  const has = (...f) => f.some((s) => String(s).toLowerCase().includes(q));
  const found = q ? {
    tours: tours.filter((t) => has(t.title, t.summary, t.style)),
    destinations: destinations.filter((d) => has(d.name, d.summary, d.tagline)),
    posts: posts.filter((p) => has(p.title, p.excerpt)),
  } : { tours: [], destinations: [], posts: [] };
  res.render('pages/search.njk', { q: req.query.q ?? '', found });
}

export const staticPage = (view, title) => (req, res) => res.render(view, { title });
export const stylesFor = () => tourStyles;
