/** accommodations */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE accommodations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL, slug text NOT NULL UNIQUE, type text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'mid-range', destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '', amenities jsonb NOT NULL DEFAULT '[]', price_range text NOT NULL DEFAULT '$$',
  image text NOT NULL DEFAULT '', status content_status NOT NULL DEFAULT 'draft',
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX accommodations_status_idx ON accommodations (status);
CREATE TABLE accommodation_media (
  accommodation_id uuid NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0, PRIMARY KEY (accommodation_id, media_id));`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE accommodation_media; DROP TABLE accommodations;`);
}
