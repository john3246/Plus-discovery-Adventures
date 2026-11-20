// Session, CSRF, current-user loading and permission guards for /admin.
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';

const isProd = env.NODE_ENV === 'production';
const PgStore = connectPgSimple(session);

export const adminSession = session({
  store: new PgStore({ pool, tableName: 'session', createTableIfMissing: false }),
  name: isProd ? '__Host-pda.sid' : 'pda.sid',
  secret: env.SESSION_SECRET ?? 'dev-only-secret-change-me-dev-only-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: 8 * 60 * 60 * 1000, path: '/' },
});

/** Synchroniser-token CSRF: token lives in the session, forms send `_csrf` (or X-CSRF-Token). */
export function csrf(req, res, next) {
  req.session.csrf ??= randomBytes(24).toString('hex');
  res.locals.csrfToken = req.session.csrf;
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const sent = String(req.body?._csrf ?? req.get('x-csrf-token') ?? '');
  const a = Buffer.from(sent);
  const b = Buffer.from(req.session.csrf);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(403).render('admin/error.njk', { message: 'Your session expired. Go back, refresh the page and try again.' });
  return next();
}

/** Loads the signed-in user and permission set from the database on every request. */
export async function loadUser(req, res, next) {
  const id = req.session.userId;
  if (!id) return next();
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.is_active, r.name AS role,
            COALESCE(array_agg(p.key) FILTER (WHERE p.key IS NOT NULL), '{}') AS perms
       FROM users u JOIN roles r ON r.id = u.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = r.id LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = $1 GROUP BY u.id, r.name`, [id]);
  const u = rows[0];
  if (!u || !u.is_active) { req.session.userId = null; return next(); }
  req.user = { id: u.id, email: u.email, name: u.full_name, role: u.role, perms: new Set(u.perms) };
  res.locals.user = req.user;
  res.locals.can = (key) => req.user.perms.has(key);
  return next();
}

export function loginRequired(req, res, next) {
  if (req.user) return next();
  return res.redirect('/admin/login');
}

/** Deny by default: every admin route declares the permission it needs. */
export const can = (key) => (req, res, next) => {
  if (req.user?.perms.has(key)) return next();
  return res.status(403).render('admin/error.njk', { message: 'You do not have permission to do that.' });
};

export function flash(req, res, next) {
  res.locals.flash = req.session.flash ?? null;
  delete req.session.flash;
  res.setFlash = (type, text) => { req.session.flash = { type, text }; };
  next();
}

export function adminHeaders(req, res, next) {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('X-Frame-Options', 'DENY');
  next();
}
