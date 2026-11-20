/** audit log */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE audit_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), user_id uuid REFERENCES users(id) ON DELETE SET NULL, action text NOT NULL,
  entity text NOT NULL, entity_id text, before jsonb, after jsonb, ip text, user_agent text);
CREATE INDEX audit_entity_idx ON audit_log (entity, entity_id);
CREATE INDEX audit_created_idx ON audit_log (created_at);
CREATE TABLE content_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), entity text NOT NULL, entity_id uuid NOT NULL, snapshot jsonb NOT NULL,
  version_number int NOT NULL, created_by uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX content_versions_entity_idx ON content_versions (entity, entity_id);`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE content_versions; DROP TABLE audit_log;`);
}
