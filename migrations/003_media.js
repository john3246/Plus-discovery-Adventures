/** media */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE media (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), storage_key text, url text NOT NULL, mime_type text, width int, height int,
  size_bytes int, alt_text text NOT NULL DEFAULT '', folder text NOT NULL DEFAULT '',
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX media_folder_idx ON media (folder);`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE media;`);
}
