import { findTours } from '../repositories/findTours.js';
import { cacheGet } from '../../../shared/cache/cacheGet.js';
import { cacheSet } from '../../../shared/cache/cacheSet.js';
import { cacheKey } from '../../../shared/cache/cacheKey.js';
import { paginate } from '../../../shared/utils/paginate.js';

export async function listTours(query, lang) {
  const key = cacheKey('list', 'tours', lang, query);
  const cached = await cacheGet(key);
  if (cached) return cached;

  const page = paginate(query);
  const rows = await findTours({ ...query, ...page });
  const result = { items: rows, total: Number(rows[0]?.total ?? 0), ...page };

  await cacheSet(key, result, 300);
  return result;
}
