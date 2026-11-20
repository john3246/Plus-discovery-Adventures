// Loads the sample data (src/data) into PostgreSQL. Skips tables that already have rows.
import { pool } from '../src/config/database.js';
import { destinations } from '../src/data/destinations.js';
import { tours } from '../src/data/tours.js';
import { accommodations, posts, reviews } from '../src/data/content.js';
import { buildItinerary, INCLUDED, EXCLUDED } from '../src/data/buildItinerary.js';
import { site } from '../src/data/site.js';

const count = async (t) => Number((await pool.query(`SELECT count(*) FROM ${t}`)).rows[0].count);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function seedDestinations() {
  if (await count('destinations')) return;
  let i = 0;
  for (const d of destinations) {
    await pool.query(
      `INSERT INTO destinations (name, slug, region, tagline, summary, best_season, image, highlights, wildlife, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published')`,
      [d.name, d.slug, d.region, d.tagline, d.summary, d.bestTime, d.image, JSON.stringify(d.highlights), JSON.stringify(d.wildlife), i++]);
  }
}

async function seedTours() {
  if (await count('tours')) return;
  for (const t of tours) {
    const { rows } = await pool.query(
      `INSERT INTO tours (title, slug, category, style, summary, duration_days, price_from, image, inclusions, exclusions,
                          rating, review_count, is_featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'published') RETURNING id`,
      [t.title, t.slug, t.category, t.style, t.summary, t.days, t.price, t.image, JSON.stringify(INCLUDED), JSON.stringify(EXCLUDED),
        t.rating, t.reviews, t.featured]);
    const id = rows[0].id;
    for (const [n, s] of t.stops.entries()) {
      await pool.query(`INSERT INTO tour_destinations (tour_id, destination_id, sort_order)
        SELECT $1, id, $3 FROM destinations WHERE slug = $2 ON CONFLICT DO NOTHING`, [id, s, n]);
    }
    for (const d of buildItinerary(t)) {
      await pool.query('INSERT INTO itinerary_days (tour_id, day_number, title, description) VALUES ($1,$2,$3,$4)', [id, d.day, d.title, d.text]);
    }
  }
}

async function seedStaysPostsReviews() {
  if (!(await count('accommodations'))) {
    for (const a of accommodations) {
      await pool.query(
        `INSERT INTO accommodations (name, slug, type, tier, destination_id, description, amenities, price_range, image, status)
         VALUES ($1,$2,$3,$4,(SELECT id FROM destinations WHERE slug = $5),$6,$7,$8,$9,'published')`,
        [a.name, a.slug, a.type, a.tier, a.destination, a.description, JSON.stringify(a.amenities), a.priceRange, a.image]);
    }
  }
  if (!(await count('posts'))) {
    for (const p of posts) {
      const cat = await pool.query(
        `INSERT INTO post_categories (name, slug) VALUES ($1,$2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [p.category, slugify(p.category)]);
      await pool.query(
        `INSERT INTO posts (title, slug, excerpt, body_html, category_id, image, published_at, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'published')`,
        [p.title, p.slug, p.excerpt, p.body.join('\n\n'), cat.rows[0].id, p.image, p.date]);
    }
  }
  if (!(await count('reviews'))) {
    for (const r of reviews) {
      await pool.query('INSERT INTO reviews (author_name, country, rating, body, source, is_approved) VALUES ($1,$2,$3,$4,$5,true)',
        [r.author, r.country, r.rating, r.text, r.source]);
    }
  }
  await pool.query(`INSERT INTO settings (key, value) VALUES ('site', $1) ON CONFLICT (key) DO NOTHING`, [JSON.stringify(site)]);
}

export async function seedDemoContent() {
  await seedDestinations();
  await seedTours();
  await seedStaysPostsReviews();
  console.log('demo content seeded');
}

if (process.argv[1]?.endsWith('seedDemoContent.js')) {
  seedDemoContent().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
}
