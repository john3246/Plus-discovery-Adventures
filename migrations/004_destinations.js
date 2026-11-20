/** destinations */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE destinations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL, slug text NOT NULL UNIQUE, region text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '', summary text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '',
  best_season text NOT NULL DEFAULT '', image text NOT NULL DEFAULT '',
  highlights jsonb NOT NULL DEFAULT '[]', wildlife jsonb NOT NULL DEFAULT '[]',
  seo_title text, seo_description text, sort_order int NOT NULL DEFAULT 0, status content_status NOT NULL DEFAULT 'draft',
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX destinations_status_idx ON destinations (status);`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE destinations;`);
}
