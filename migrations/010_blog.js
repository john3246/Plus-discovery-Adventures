/** blog */
export async function up(pgm) {
  pgm.sql(`CREATE TABLE post_categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL, slug text NOT NULL UNIQUE);
CREATE TABLE posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), title text NOT NULL, slug text NOT NULL UNIQUE, excerpt text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '', category_id uuid REFERENCES post_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL, image text NOT NULL DEFAULT '', published_at timestamptz,
  seo_title text, seo_description text, status content_status NOT NULL DEFAULT 'draft',
    deleted_at timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL);
CREATE INDEX posts_status_published_idx ON posts (status, published_at);
CREATE TABLE tags (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL, slug text NOT NULL UNIQUE);
CREATE TABLE post_tags (post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (post_id, tag_id));`);
}

export async function down(pgm) {
  pgm.sql(`DROP TABLE post_tags; DROP TABLE tags; DROP TABLE posts; DROP TABLE post_categories;`);
}
