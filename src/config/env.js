import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(64),
  CSRF_SECRET: z.string().min(32),
  SMTP_HOST: z.string(), SMTP_USER: z.string(), SMTP_PASS: z.string(), MAIL_FROM: z.string(),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_BUCKET: z.string().optional(), STORAGE_KEY: z.string().optional(), STORAGE_SECRET: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string(), TURNSTILE_SECRET: z.string(),
  CLOUDFLARE_ZONE_ID: z.string().optional(), CLOUDFLARE_API_TOKEN: z.string().optional(),
  DEFAULT_LANG: z.string().default('en'),
  SUPPORTED_LANGS: z.string().default('en,sw'),
});

// App refuses to boot if a required variable is missing.
export const env = schema.parse(process.env);
