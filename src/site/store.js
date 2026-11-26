// Public data source. Reads PostgreSQL when DATABASE_URL is set, otherwise the bundled sample data.
// getSnapshot() is cached for a few seconds; admin writes call invalidateStore().
import { pool } from '../config/database.js';
import { destinations as sampleDest } from '../data/destinations.js';
import { tours as sampleTours, buildTour } from '../data/tours.js';
import { accommodations as sampleStays, posts as samplePosts, reviews as sampleReviews, gallery, faqs } from '../data/content.js';
import { buildItinerary } from '../data/buildItinerary.js';
import { site as defaultSite } from '../data/site.js';

const TTL_MS = 15000;
let cache = null;
let cachedAt = 0;

export const invalidateStore = () => { cache = null; };

async function fromDb() {
  const q = (sql) => pool.query(sql).then((r) => r.rows);
  const [d, t, a, p, r, st] = await Promise.all([
    q(`SELECT * FROM destinations WHERE status = 'published' AND deleted_at IS NULL ORDER BY sort_order, name`),
    q(`SELECT t.*, COALESCE(array_agg(d.slug ORDER BY td.sort_order) FILTER (WHERE d.slug IS NOT NULL), '{}') AS stops
         FROM tours t LEFT JOIN tour_destinations td ON td.tour_id = t.id LEFT JOIN destinations d ON d.id = td.destination_id
        WHERE t.status = 'published' AND t.deleted_at IS NULL GROUP BY t.id ORDER BY t.created_at, t.title`),
    q(`SELECT a.*, d.slug AS destination FROM accommodations a LEFT JOIN destinations d ON d.id = a.destination_id
        WHERE a.status = 'published' AND a.deleted_at IS NULL ORDER BY a.created_at, a.name`),
    q(`SELECT p.*, c.name AS category FROM posts p LEFT JOIN post_categories c ON c.id = p.category_id
        WHERE p.status = 'published' AND p.deleted_at IS NULL ORDER BY p.published_at DESC NULLS LAST`),
    q(`SELECT * FROM reviews WHERE is_approved ORDER BY created_at DESC LIMIT 12`),
    q(`SELECT value FROM settings WHERE key = 'site'`),
  ]);
  return {
    site: { ...defaultSite, ...(st[0]?.value ?? {}) },
    destinations: d.map((x) => ({ slug: x.slug, name: x.name, region: x.region, tagline: x.tagline, summary: x.summary, image: x.image,
      highlights: x.highlights, wildlife: x.wildlife, bestTime: x.best_season })),
    tours: t.map((x) => buildTour({ id: x.id, slug: x.slug, title: x.title, category: x.category, style: x.style, days: x.duration_days,
      price: x.price_from, image: x.image, stops: x.stops, summary: x.summary, featured: x.is_featured,
      rating: x.rating == null ? undefined : String(Number(x.rating)), reviews: x.review_count || undefined })),
    accommodations: a.map((x) => ({ slug: x.slug, name: x.name, type: x.type, tier: x.tier, destination: x.destination, image: x.image,
      priceRange: x.price_range, amenities: x.amenities, description: x.description })),
    posts: p.map((x) => ({ slug: x.slug, title: x.title, category: x.category ?? 'General', date: x.published_at ?? x.created_at,
      image: x.image, excerpt: x.excerpt, body: x.body_html.split(/\n{2,}/).filter(Boolean) })),
    reviews: r.map((x) => ({ author: x.author_name, country: x.country, rating: x.rating, source: x.source, text: x.body })),
  };
}

const fromSample = () => ({ site: defaultSite, destinations: sampleDest, tours: sampleTours, accommodations: sampleStays, posts: samplePosts, reviews: sampleReviews.filter((r) => r.source !== 'Sample') });

export async function getSnapshot() {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  const data = pool ? await fromDb() : fromSample();
  cache = { ...data, gallery, faqs };
  cachedAt = Date.now();
  return cache;
}

export async function getItinerary(tour) {
  if (tour.itinerary) return tour.itinerary;
  if (pool && tour.id) {
    const { rows } = await pool.query('SELECT day_number AS day, title, description AS text FROM itinerary_days WHERE tour_id = $1 ORDER BY day_number', [tour.id]);
    if (rows.length) return rows;
  }
  return buildItinerary(tour);
}
