/** bookings */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE bookings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), reference text NOT NULL UNIQUE, tour_id uuid REFERENCES tours(id) ON DELETE SET NULL,
  customer_name text NOT NULL, customer_email text NOT NULL, customer_phone text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '', travel_date date, adults int NOT NULL CHECK (adults >= 1), children int NOT NULL DEFAULT 0,
  message text NOT NULL DEFAULT '', total_amount int NOT NULL DEFAULT 0, currency char(3) NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','confirmed','paid','completed','cancelled')),
  internal_notes text NOT NULL DEFAULT '', assigned_to uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_travel_date_idx ON bookings (travel_date);
CREATE INDEX bookings_email_idx ON bookings (lower(customer_email));
CREATE TABLE booking_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL, note text NOT NULL DEFAULT '', actor_id uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX booking_events_booking_idx ON booking_events (booking_id);`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE booking_events; DROP TABLE bookings;`);
}
