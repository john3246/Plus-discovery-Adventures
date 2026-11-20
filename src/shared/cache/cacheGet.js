import { redis } from '../../config/redis.js';

export async function cacheGet(key) {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // Redis down: fall back to PostgreSQL
  }
}
