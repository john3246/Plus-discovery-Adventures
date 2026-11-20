/** indexes */
export async function up(pgm) {
  pgm.sql(`CREATE INDEX tours_search_idx ON tours USING gin (to_tsvector('english', title || ' ' || summary));
CREATE INDEX destinations_search_idx ON destinations USING gin (to_tsvector('english', name || ' ' || summary));
CREATE INDEX posts_search_idx ON posts USING gin (to_tsvector('english', title || ' ' || excerpt));
CREATE TRIGGER users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER destinations_updated BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tours_updated BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER accommodations_updated BEFORE UPDATE ON accommodations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER enquiries_updated BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER posts_updated BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reviews_updated BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER settings_updated BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER pages_updated BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();`);
}

export async function down(pgm) {
  pgm.sql(`DROP TRIGGER IF EXISTS users_updated ON users;
DROP TRIGGER IF EXISTS roles_updated ON roles;
DROP TRIGGER IF EXISTS destinations_updated ON destinations;
DROP TRIGGER IF EXISTS tours_updated ON tours;
DROP TRIGGER IF EXISTS accommodations_updated ON accommodations;
DROP TRIGGER IF EXISTS bookings_updated ON bookings;
DROP TRIGGER IF EXISTS enquiries_updated ON enquiries;
DROP TRIGGER IF EXISTS posts_updated ON posts;
DROP TRIGGER IF EXISTS reviews_updated ON reviews;
DROP TRIGGER IF EXISTS settings_updated ON settings;
DROP TRIGGER IF EXISTS pages_updated ON pages;
DROP INDEX posts_search_idx; DROP INDEX destinations_search_idx; DROP INDEX tours_search_idx;`);
}
