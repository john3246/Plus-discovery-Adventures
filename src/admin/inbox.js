// Bookings, enquiries and reviews: lists, detail pages and status workflow.
import { pool } from '../config/database.js';
import { recordAudit } from './audit.js';

const PAGE = 25;
export const BOOKING_STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'paid', 'completed', 'cancelled'];
export const ENQUIRY_STATUSES = ['new', 'in-progress', 'replied', 'closed'];
const page = (req) => Math.max(1, Number(req.query.page) || 1);
const csvCell = (v) => { const s = String(v ?? ''); return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`; };

export async function listBookings(req, res) {
  const status = BOOKING_STATUSES.includes(req.query.status) ? req.query.status : '';
  const q = String(req.query.q ?? '').trim().slice(0, 80);
  const { rows } = await pool.query(
    `SELECT b.*, t.title AS tour, count(*) OVER() AS total FROM bookings b LEFT JOIN tours t ON t.id = b.tour_id
      WHERE ($1 = '' OR b.status = $1) AND ($2 = '' OR b.customer_name ILIKE '%' || $2 || '%' OR b.customer_email ILIKE '%' || $2 || '%' OR b.reference ILIKE '%' || $2 || '%')
      ORDER BY b.created_at DESC LIMIT ${PAGE} OFFSET $3`, [status, q, (page(req) - 1) * PAGE]);
  res.render('admin/bookings/list.njk', { rows, status, q, statuses: BOOKING_STATUSES, page: page(req), pages: Math.max(1, Math.ceil(Number(rows[0]?.total ?? 0) / PAGE)) });
}

export async function exportBookings(req, res) {
  const { rows } = await pool.query(`SELECT b.reference, b.created_at, b.status, b.customer_name, b.customer_email, b.customer_phone, b.country,
      b.travel_date, b.adults, b.children, b.total_amount, b.currency, t.title AS tour FROM bookings b LEFT JOIN tours t ON t.id = b.tour_id ORDER BY b.created_at DESC`);
  const head = ['reference', 'created_at', 'status', 'customer_name', 'customer_email', 'customer_phone', 'country', 'travel_date', 'adults', 'children', 'total_amount', 'currency', 'tour'];
  await recordAudit(req, 'export', 'bookings', null);
  res.type('text/csv').attachment('bookings.csv').send([head.join(','), ...rows.map((r) => head.map((h) => csvCell(r[h])).join(','))].join('\n'));
}

export async function showBooking(req, res, next) {
  const { rows } = await pool.query(`SELECT b.*, t.title AS tour, t.slug AS tour_slug FROM bookings b LEFT JOIN tours t ON t.id = b.tour_id WHERE b.id = $1`, [req.params.id]).catch(() => ({ rows: [] }));
  if (!rows[0]) return next();
  const events = await pool.query(`SELECT e.*, u.full_name FROM booking_events e LEFT JOIN users u ON u.id = e.actor_id WHERE booking_id = $1 ORDER BY e.created_at DESC`, [rows[0].id]);
  return res.render('admin/bookings/show.njk', { b: rows[0], events: events.rows, statuses: BOOKING_STATUSES });
}

export async function updateBooking(req, res, next) {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]).catch(() => ({ rows: [] }));
  const before = rows[0];
  if (!before) return next();
  const status = BOOKING_STATUSES.includes(req.body.status) ? req.body.status : before.status;
  const amount = Math.max(0, parseInt(req.body.total_amount, 10) || 0);
  const notes = String(req.body.internal_notes ?? '').slice(0, 5000);
  await pool.query('UPDATE bookings SET status = $2, total_amount = $3, internal_notes = $4, assigned_to = COALESCE(assigned_to, $5) WHERE id = $1',
    [before.id, status, amount, notes, req.user.id]);
  if (status !== before.status) {
    await pool.query(`INSERT INTO booking_events (booking_id, type, note, actor_id) VALUES ($1,'status',$2,$3)`, [before.id, `${before.status} → ${status}`, req.user.id]);
  }
  await recordAudit(req, 'update', 'bookings', before.id, { status: before.status, total: before.total_amount }, { status, total: amount });
  res.setFlash('ok', 'Booking updated.');
  return res.redirect(`/admin/bookings/${before.id}`);
}

export async function listEnquiries(req, res) {
  const status = ENQUIRY_STATUSES.includes(req.query.status) ? req.query.status : '';
  const { rows } = await pool.query(
    `SELECT *, count(*) OVER() AS total FROM enquiries WHERE ($1 = '' OR status = $1) ORDER BY created_at DESC LIMIT ${PAGE} OFFSET $2`, [status, (page(req) - 1) * PAGE]);
  res.render('admin/enquiries/list.njk', { rows, status, statuses: ENQUIRY_STATUSES, page: page(req), pages: Math.max(1, Math.ceil(Number(rows[0]?.total ?? 0) / PAGE)) });
}

export async function showEnquiry(req, res, next) {
  const { rows } = await pool.query('SELECT * FROM enquiries WHERE id = $1', [req.params.id]).catch(() => ({ rows: [] }));
  if (!rows[0]) return next();
  return res.render('admin/enquiries/show.njk', { e: rows[0], statuses: ENQUIRY_STATUSES });
}

export async function updateEnquiry(req, res, next) {
  const { rows } = await pool.query('SELECT * FROM enquiries WHERE id = $1', [req.params.id]).catch(() => ({ rows: [] }));
  if (!rows[0]) return next();
  const status = ENQUIRY_STATUSES.includes(req.body.status) ? req.body.status : rows[0].status;
  await pool.query('UPDATE enquiries SET status = $2, assigned_to = COALESCE(assigned_to, $3) WHERE id = $1', [rows[0].id, status, req.user.id]);
  await recordAudit(req, 'update', 'enquiries', rows[0].id, { status: rows[0].status }, { status });
  res.setFlash('ok', 'Enquiry updated.');
  return res.redirect(`/admin/enquiries/${rows[0].id}`);
}

export async function listReviews(req, res) {
  const { rows } = await pool.query(`SELECT r.*, t.title AS tour FROM reviews r LEFT JOIN tours t ON t.id = r.tour_id ORDER BY r.is_approved, r.created_at DESC LIMIT 100`);
  res.render('admin/reviews/list.njk', { rows });
}

export async function setReviewApproval(req, res, next) {
  if (!['approve', 'hide'].includes(req.params.action)) return next();
  const approve = req.params.action === 'approve';
  const r = await pool.query('UPDATE reviews SET is_approved = $2 WHERE id = $1 RETURNING id', [req.params.id, approve]).catch(() => ({ rowCount: 0 }));
  if (!r.rowCount) return next();
  await recordAudit(req, approve ? 'approve' : 'hide', 'reviews', req.params.id);
  res.setFlash('ok', approve ? 'Review approved.' : 'Review hidden.');
  return res.redirect('/admin/reviews');
}
