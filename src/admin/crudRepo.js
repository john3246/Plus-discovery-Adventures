// SQL for generic admin CRUD. Table and column names come from resources.js (static allowlist).
import { pool } from '../config/database.js';

const dbFields = (cfg) => cfg.fields.filter((f) => !f.virtual);
const jsonish = (f) => f.type === 'lines';
const encode = (f, v) => (jsonish(f) ? JSON.stringify(v ?? []) : v);

export async function listRows(cfg, { q, status, limit, offset }) {
  const where = [cfg.softDelete ? 'deleted_at IS NULL' : 'true'];
  const params = [];
  if (q) {
    params.push(`%${q}%`);
    where.push(`(${cfg.search.map((c) => `${c} ILIKE $${params.length}`).join(' OR ')})`);
  }
  if (status && cfg.hasStatus) { params.push(status); where.push(`status = $${params.length}::content_status`); }
  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT *, count(*) OVER() AS total FROM ${cfg.table} WHERE ${where.join(' AND ')} ORDER BY ${cfg.order} LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
}

export async function findRow(cfg, id) {
  const { rows } = await pool.query(`SELECT * FROM ${cfg.table} WHERE id = $1 ${cfg.softDelete ? 'AND deleted_at IS NULL' : ''}`, [id]);
  return rows[0] ?? null;
}

export async function insertRow(cfg, values, userId, db = pool) {
  const f = dbFields(cfg);
  const cols = [...f.map((x) => x.name), 'created_by', 'updated_by'];
  const params = [...f.map((x) => encode(x, values[x.name])), userId, userId];
  const { rows } = await db.query(
    `INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`, params);
  return rows[0].id;
}

export async function updateRow(cfg, id, values, userId, db = pool) {
  const f = dbFields(cfg);
  const sets = [...f.map((x, i) => `${x.name} = $${i + 1}`), `updated_by = $${f.length + 1}`];
  const params = [...f.map((x) => encode(x, values[x.name])), userId, id];
  await db.query(`UPDATE ${cfg.table} SET ${sets.join(', ')} WHERE id = $${f.length + 2}`, params);
}

export async function removeRow(cfg, id, userId) {
  if (cfg.softDelete) await pool.query(`UPDATE ${cfg.table} SET deleted_at = now(), updated_by = $2 WHERE id = $1`, [id, userId]);
  else await pool.query(`DELETE FROM ${cfg.table} WHERE id = $1`, [id]);
}

export async function selectOptions(source) {
  if (source === 'destinations') {
    const { rows } = await pool.query(`SELECT id AS value, name AS label FROM destinations WHERE deleted_at IS NULL ORDER BY sort_order, name`);
    return rows;
  }
  return [];
}
