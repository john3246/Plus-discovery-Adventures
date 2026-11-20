/** itinerary days */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE itinerary_days (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  day_number int NOT NULL, title text NOT NULL, description text NOT NULL DEFAULT '', overnight_place text NOT NULL DEFAULT '',
  UNIQUE (tour_id, day_number));`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE itinerary_days;`);
}
