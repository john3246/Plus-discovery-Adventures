/** enquiries */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE enquiries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), kind text NOT NULL DEFAULT 'contact' CHECK (kind IN ('contact','trip-request')),
  name text NOT NULL, email text NOT NULL, phone text NOT NULL DEFAULT '', country text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '', message text NOT NULL DEFAULT '', details jsonb NOT NULL DEFAULT '{}',
  source_page text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in-progress','replied','closed')),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL, ip_hash text);
CREATE INDEX enquiries_status_idx ON enquiries (status);
CREATE INDEX enquiries_created_idx ON enquiries (created_at);
CREATE TABLE newsletter_subscribers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), email text NOT NULL, confirmed_at timestamptz, unsubscribed_at timestamptz);
CREATE UNIQUE INDEX newsletter_email_uq ON newsletter_subscribers (lower(email));`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE newsletter_subscribers; DROP TABLE enquiries;`);
}
