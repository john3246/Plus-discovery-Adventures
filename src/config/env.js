import { z } from 'zod';

// DATABASE_URL is optional: without it the public site runs from sample data and /admin is disabled.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  DEFAULT_LANG: z.string().default('en'),
  SUPPORTED_LANGS: z.string().default('en'),
});

export const env = schema.parse(process.env);
export const hasDb = Boolean(env.DATABASE_URL);

if (hasDb && env.NODE_ENV === 'production' && !env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET (32+ chars) is required in production');
}
