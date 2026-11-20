/** extensions and enums */
export async function up(pgm) {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;`);
}

export async function down(pgm) {
  pgm.sql(`DROP FUNCTION IF EXISTS set_updated_at(); DROP TYPE IF EXISTS content_status;`);
}
