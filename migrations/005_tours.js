/** tours */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE tours (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), title text NOT NULL, slug text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('safari','kilimanjaro','day-trip','zanzibar')),
  style text NOT NULL DEFAULT 'mid-range', summary text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '',
  duration_days int NOT NULL CHECK (duration_days >= 1), price_from int NOT NULL CHECK (price_from >= 0),
  currency char(3) NOT NULL DEFAULT 'USD', max_group_size int, image text NOT NULL DEFAULT '',
  inclusions jsonb NOT NULL DEFAULT '[]', exclusions jsonb NOT NULL DEFAULT '[]',
  rating numeric(2,1), review_count int NOT NULL DEFAULT 0, is_featured boolean NOT NULL DEFAULT false,
  seo_title text, seo_description text, status content_status NOT NULL DEFAULT 'draft',
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX tours_status_idx ON tours (status);
CREATE INDEX tours_category_idx ON tours (category);
CREATE INDEX tours_featured_idx ON tours (is_featured);
CREATE INDEX tours_title_trgm_idx ON tours USING gin (title gin_trgm_ops);
CREATE TABLE tour_destinations (
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0, PRIMARY KEY (tour_id, destination_id));
CREATE TABLE tour_media (
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0, PRIMARY KEY (tour_id, media_id));
CREATE TABLE price_tiers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  label text NOT NULL, min_travellers int NOT NULL, max_travellers int NOT NULL,
  price_per_person int NOT NULL, season text NOT NULL DEFAULT '', CHECK (min_travellers <= max_travellers));`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE price_tiers; DROP TABLE tour_media; DROP TABLE tour_destinations; DROP TABLE tours;`);
}
