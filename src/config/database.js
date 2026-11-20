import pg from 'pg';
import { env, hasDb } from './env.js';

// pool is null when DATABASE_URL is not set (static sample-data mode).
export const pool = hasDb
  ? new pg.Pool({ connectionString: env.DATABASE_URL, max: 10, statement_timeout: 30000 })
  : null;
