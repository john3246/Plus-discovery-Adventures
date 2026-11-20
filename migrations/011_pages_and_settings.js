/** pages and settings */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE pages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), slug text NOT NULL UNIQUE, title text NOT NULL, sections jsonb NOT NULL DEFAULT '[]',
  seo_title text, seo_description text, status content_status NOT NULL DEFAULT 'published');
CREATE TABLE settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), key text NOT NULL UNIQUE, value jsonb NOT NULL DEFAULT '{}');`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE settings; DROP TABLE pages;`);
}
