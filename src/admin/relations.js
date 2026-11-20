// Resource-specific extras that live outside the main table row (tour stops, itinerary, post category).
import { slugify } from './fields.js';

export const relations = {
  tours: {
    async load(db, row) {
      const stops = await db.query('SELECT destination_id FROM tour_destinations WHERE tour_id = $1 ORDER BY sort_order', [row.id]);
      const days = await db.query('SELECT title, description FROM itinerary_days WHERE tour_id = $1 ORDER BY day_number', [row.id]);
      return { stops: stops.rows.map((r) => r.destination_id), itinerary: days.rows.map((d) => `${d.title} :: ${d.description}`).join('\n') };
    },
    async save(db, id, v) {
      await db.query('DELETE FROM tour_destinations WHERE tour_id = $1', [id]);
      for (const [i, dest] of (v.stops ?? []).entries()) {
        await db.query('INSERT INTO tour_destinations (tour_id, destination_id, sort_order) VALUES ($1,$2,$3)', [id, dest, i]);
      }
      await db.query('DELETE FROM itinerary_days WHERE tour_id = $1', [id]);
      const rows = String(v.itinerary ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 60);
      for (const [i, line] of rows.entries()) {
        const [title, ...rest] = line.split('::');
        await db.query('INSERT INTO itinerary_days (tour_id, day_number, title, description) VALUES ($1,$2,$3,$4)',
          [id, i + 1, title.trim().slice(0, 200), rest.join('::').trim()]);
      }
    },
  },
  posts: {
    async load(db, row) {
      const r = await db.query('SELECT name FROM post_categories WHERE id = $1', [row.category_id]);
      return { category: r.rows[0]?.name ?? '' };
    },
    async save(db, id, v) {
      const name = String(v.category ?? '').trim();
      if (!name) return db.query('UPDATE posts SET category_id = NULL WHERE id = $1', [id]);
      const c = await db.query(
        'INSERT INTO post_categories (name, slug) VALUES ($1,$2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id', [name, slugify(name)]);
      return db.query('UPDATE posts SET category_id = $1 WHERE id = $2', [c.rows[0].id, id]);
    },
  },
};
