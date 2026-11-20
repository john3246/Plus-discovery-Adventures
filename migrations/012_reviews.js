/** reviews */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), tour_id uuid REFERENCES tours(id) ON DELETE SET NULL, author_name text NOT NULL,
  country text NOT NULL DEFAULT '', rating int NOT NULL CHECK (rating BETWEEN 1 AND 5), body text NOT NULL,
  source text NOT NULL DEFAULT 'Website', is_approved boolean NOT NULL DEFAULT false);
CREATE INDEX reviews_approved_idx ON reviews (is_approved);`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE reviews;`);
}
