// Staff management and site settings.
import argon2 from 'argon2';
import { pool } from '../config/database.js';
import { site as defaultSite } from '../data/site.js';
import { invalidateStore } from '../site/store.js';
import { recordAudit } from './audit.js';

const roles = () => pool.query('SELECT id, name, description FROM roles ORDER BY name').then((r) => r.rows);

export async function listUsers(req, res) {
  const { rows } = await pool.query(`SELECT u.*, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.created_at`);
  res.render('admin/users/list.njk', { rows });
}

export async function userForm(req, res, next) {
  const isNew = !req.params.id;
  const user = isNew ? { is_active: true } : (await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]).catch(() => ({ rows: [] }))).rows[0];
  if (!user) return next();
  return res.render('admin/users/form.njk', { u: user, roles: await roles(), errors: {}, isNew });
}

export async function saveUser(req, res, next) {
  const id = req.params.id;
  const existing = id ? (await pool.query('SELECT * FROM users WHERE id = $1', [id]).catch(() => ({ rows: [] }))).rows[0] : null;
  if (id && !existing) return next();
  const b = req.body;
  const roleList = await roles();
  const errors = {};
  const email = String(b.email ?? '').trim().toLowerCase();
  const name = String(b.full_name ?? '').trim().slice(0, 100);
  const role = roleList.find((r) => r.id === b.role_id);
  const password = String(b.password ?? '');
  const active = b.is_active === 'on';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email';
  if (!name) errors.full_name = 'Required';
  if (!role) errors.role_id = 'Choose a role';
  if (role?.name === 'super_admin' && req.user.role !== 'super_admin') errors.role_id = 'Only a super admin can assign this role';
  if ((!id || password) && password.length < 12) errors.password = 'Use at least 12 characters';
  if (id === req.user.id && !active) errors.is_active = 'You cannot deactivate your own account';
  const u = { ...existing, ...b, is_active: active };
  if (Object.keys(errors).length) return res.status(422).render('admin/users/form.njk', { u, roles: roleList, errors, isNew: !id });

  try {
    const hash = password ? await argon2.hash(password, { type: argon2.argon2id }) : null;
    if (id) {
      await pool.query(`UPDATE users SET email=$2, full_name=$3, role_id=$4, is_active=$5, password_hash = COALESCE($6, password_hash),
        failed_logins = 0, locked_until = NULL WHERE id = $1`, [id, email, name, role.id, active, hash]);
    } else {
      await pool.query('INSERT INTO users (email, full_name, role_id, is_active, password_hash) VALUES ($1,$2,$3,$4,$5)', [email, name, role.id, active, hash]);
    }
    await recordAudit(req, id ? 'update' : 'create', 'users', id, existing && { email: existing.email, role_id: existing.role_id, is_active: existing.is_active }, { email, role: role.name, is_active: active });
  } catch (e) {
    if (e.code === '23505') return res.status(422).render('admin/users/form.njk', { u, roles: roleList, errors: { email: 'That email is already in use' }, isNew: !id });
    throw e;
  }
  res.setFlash('ok', 'User saved.');
  return res.redirect('/admin/users');
}

const SETTING_FIELDS = [['name', 'Brand name'], ['fullName', 'Full company name'], ['tagline', 'Tagline'], ['email', 'Contact email'], ['phone', 'Phone'], ['address', 'Address']];

export async function settingsPage(req, res) {
  const { rows } = await pool.query(`SELECT value FROM settings WHERE key = 'site'`);
  res.render('admin/settings.njk', { values: { ...defaultSite, ...(rows[0]?.value ?? {}) }, fields: SETTING_FIELDS });
}

export async function saveSettings(req, res) {
  const value = Object.fromEntries(SETTING_FIELDS.map(([k]) => [k, String(req.body[k] ?? '').trim().slice(0, 200)]));
  await pool.query(`INSERT INTO settings (key, value) VALUES ('site', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify(value)]);
  await recordAudit(req, 'update', 'settings', 'site', null, value);
  invalidateStore();
  res.setFlash('ok', 'Settings saved.');
  res.redirect('/admin/settings');
}

export async function auditPage(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const entity = String(req.query.entity ?? '').slice(0, 40);
  const { rows } = await pool.query(
    `SELECT a.*, u.full_name, count(*) OVER() AS total FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
      WHERE ($1 = '' OR a.entity = $1) ORDER BY a.created_at DESC LIMIT 50 OFFSET $2`, [entity, (page - 1) * 50]);
  const entities = (await pool.query('SELECT DISTINCT entity FROM audit_log ORDER BY entity')).rows.map((r) => r.entity);
  res.render('admin/audit.njk', { rows, entity, entities, page, pages: Math.max(1, Math.ceil(Number(rows[0]?.total ?? 0) / 50)) });
}
