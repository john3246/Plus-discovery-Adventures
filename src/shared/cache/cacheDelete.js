import { redis } from '../../config/redis.js';

/** Delete keys by prefix using SCAN (never KEYS). */
export async function cacheDelete(prefix) {
  if (!redis) return;
  const stream = redis.scanStream({ match: `${prefix}*`, count: 100 });
  for await (const keys of stream) if (keys.length) await redis.del(keys);
}
