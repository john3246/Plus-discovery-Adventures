// Page controllers for home, blog, gallery, search and static pages.
import { getSnapshot } from '../store.js';
import { whyUs, steps, tourStyles } from '../../data/site.js';

function destinationStats(d, tours) {
  const prices = tours.filter((t) => t.stops.includes(d.slug)).map((t) => t.price);
  return { ...d, count: prices.length, from: prices.length ? Math.min(...prices) : null, to: prices.length ? Math.max(...prices) : null };
}

export async function homePage(req, res) {
  const { tours, destinations, posts, reviews, accommodations, faqs } = await getSnapshot();
  const byCat = (c) => tours.filter((t) => t.category === c);
  res.render('pages/home.njk', {
    featured: tours.filter((t) => t.featured),
    byStyle: Object.fromEntries(['camping', 'mid-range', 'luxury', 'migration'].map((s) => [s, tours.filter((t) => t.style === s && t.category === 'safari').slice(0, 3)])),
    climbs: byCat('kilimanjaro').slice(0, 3),
    dayTrips: byCat('day-trip').slice(0, 3),
    zanzibarTrips: byCat('zanzibar').slice(0, 3),
    destinations: destinations.slice(0, 8),
    popular: ['serengeti', 'ngorongoro', 'tarangire', 'zanzibar'].map((s) => destinations.find((d) => d.slug === s)).filter(Boolean).map((d) => destinationStats(d, tours)),
    stays: accommodations.slice(0, 3), faqs: faqs.slice(0, 4), steps,
    stats: [[tours.length, 'Trips to choose from'], [destinations.length, 'Destinations'], [accommodations.length, 'Handpicked stays'], ['1', 'Planner per trip']],
    posts: posts.slice(0, 3), reviews, whyUs,
    styles: tourStyles.concat([['migration', 'Great Migration', 'Follow the herds across the Serengeti.']]),
  });
}

export const blogPage = async (req, res) => {
  const { posts } = await getSnapshot();
  const items = req.params.category ? posts.filter((p) => p.category.toLowerCase().replace(/ /g, '-') === req.params.category) : posts;
  res.render('pages/blog/list.njk', { items, categories: [...new Set(posts.map((p) => p.category))] });
};

export async function blogPostPage(req, res, next) {
  const { posts } = await getSnapshot();
  const post = posts.find((p) => p.slug === req.params.slug);
  if (!post) return next();
  res.render('pages/blog/show.njk', { post, related: posts.filter((p) => p.slug !== post.slug).slice(0, 3) });
}

export const galleryPage = async (req, res) => res.render('pages/gallery.njk', { images: (await getSnapshot()).gallery });
export const reviewsPage = async (req, res) => res.render('pages/reviews.njk', { reviews: (await getSnapshot()).reviews });
export const faqsPage = async (req, res) => res.render('pages/faqs.njk', { faqs: (await getSnapshot()).faqs });
export const aboutPage = (req, res) => res.render('pages/about.njk', { whyUs, steps });
export const travelGuidePage = async (req, res) => {
  const { destinations, posts } = await getSnapshot();
  res.render('pages/travelGuide.njk', { destinations, posts });
};

export async function searchPage(req, res) {
  const { tours, destinations, posts } = await getSnapshot();
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
