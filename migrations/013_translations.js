/** translations */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE translations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), entity text NOT NULL, entity_id uuid NOT NULL, language text NOT NULL,
  field text NOT NULL, text text NOT NULL, UNIQUE (entity, entity_id, language, field));`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE translations;`);
}
