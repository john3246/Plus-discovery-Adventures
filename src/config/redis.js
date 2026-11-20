import Redis from 'ioredis';
import { env } from './env.js';

// Optional: cache helpers no-op when REDIS_URL is unset.
export const redis = env.REDIS_URL ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: false }) : null;
