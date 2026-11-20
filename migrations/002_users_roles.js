/** users roles */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL UNIQUE, description text NOT NULL DEFAULT '');
CREATE TABLE permissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), key text NOT NULL UNIQUE);
CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id));
CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL, password_hash text NOT NULL, full_name text NOT NULL,
  role_id uuid NOT NULL REFERENCES roles(id), is_active boolean NOT NULL DEFAULT true,
  failed_logins int NOT NULL DEFAULT 0, locked_until timestamptz, last_login_at timestamptz, totp_secret text);
CREATE UNIQUE INDEX users_email_lower_uq ON users (lower(email));
CREATE INDEX users_role_idx ON users (role_id);
CREATE TABLE session (sid varchar NOT NULL PRIMARY KEY, sess json NOT NULL, expire timestamp(6) NOT NULL);
CREATE INDEX session_expire_idx ON session (expire);`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE session; DROP TABLE users; DROP TABLE role_permissions; DROP TABLE permissions; DROP TABLE roles;`);
}
