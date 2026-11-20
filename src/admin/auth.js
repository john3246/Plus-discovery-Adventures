// Login, logout, own-password change.
import argon2 from 'argon2';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../config/database.js';
import { recordAudit } from './audit.js';

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
// A real hash to compare against when the email is unknown, so timing does not reveal valid emails.
const DUMMY = await argon2.hash('not-a-real-password', { type: argon2.argon2id });
const GENERIC = 'Invalid email or password.';

export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).render('admin/auth/login.njk', { error: 'Too many attempts. Try again later.', email: '' }) });

export const loginPage = (req, res) => (req.user ? res.redirect('/admin') : res.render('admin/auth/login.njk', { error: null, email: '' }));

export async function loginSubmit(req, res) {
  const email = String(req.body.email ?? '').trim().toLowerCase().slice(0, 150);
  const password = String(req.body.password ?? '').slice(0, 200);
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = $1', [email]);
  const user = rows[0];
  const locked = user?.locked_until && new Date(user.locked_until) > new Date();
  const ok = await argon2.verify(user?.password_hash ?? DUMMY, password).catch(() => false);

  if (!user || !user.is_active || locked || !ok) {
    if (user && !ok) {
      await pool.query(
        `UPDATE users SET failed_logins = failed_logins + 1,
           locked_until = CASE WHEN failed_logins + 1 >= $2 THEN now() + ($3 || ' minutes')::interval ELSE locked_until END,
           failed_logins = CASE WHEN failed_logins + 1 >= $2 THEN 0 ELSE failed_logins + 1 END WHERE id = $1`, [user.id, MAX_FAILS, LOCK_MINUTES]);
    }
    await new Promise((r) => setTimeout(r, 400)); // short delay on each failure
    return res.status(401).render('admin/auth/login.njk', { error: GENERIC, email });
  }

  await pool.query('UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = $1', [user.id]);
  req.session.regenerate((err) => {
    if (err) throw err;
    req.session.userId = user.id;
    req.user = { id: user.id };
    recordAudit(req, 'login', 'user', user.id).finally(() => res.redirect('/admin'));
  });
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie(req.app.get('adminCookie'));
    res.redirect('/admin/login');
  });
}

export const profilePage = (req, res) => res.render('admin/profile.njk', { errors: {} });

export async function changePassword(req, res) {
  const { current = '', password = '', confirm = '' } = req.body;
  const errors = {};
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!(await argon2.verify(rows[0].password_hash, String(current)).catch(() => false))) errors.current = 'Current password is incorrect.';
  if (String(password).length < 12) errors.password = 'Use at least 12 characters.';
  else if (password !== confirm) errors.confirm = 'Passwords do not match.';
  if (Object.keys(errors).length) return res.status(422).render('admin/profile.njk', { errors });
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await argon2.hash(String(password), { type: argon2.argon2id }), req.user.id]);
  await recordAudit(req, 'password_change', 'user', req.user.id);
  res.setFlash('ok', 'Password updated.');
  return res.redirect('/admin/profile');
}
