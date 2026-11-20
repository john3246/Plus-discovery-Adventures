import { pool } from '../../../config/database.js';

const SORTS = { newest: 't.created_at DESC', price: 't.price_from ASC' };

export async function findTours({ category, limit, offset, sort = 'newest' }, db = pool) {
  const { rows } = await db.query(
    `SELECT t.id, t.slug, t.title, t.summary, t.duration_days, t.price_from,
            m.url AS hero_url, COUNT(*) OVER() AS total
       FROM tours t LEFT JOIN media m ON m.id = t.hero_media_id
      WHERE t.status = 'published' AND t.deleted_at IS NULL
        AND ($1::text IS NULL OR t.category = $1)
      ORDER BY ${SORTS[sort] ?? SORTS.newest}
      LIMIT $2 OFFSET $3`,
    [category ?? null, limit, offset],
  );
  return rows;
}
