import { pool } from '../config/database.js';

export async function dashboardPage(req, res) {
  const q = (sql, p) => pool.query(sql, p).then((r) => r.rows);
  const [kpi, byStatus, topTours, recentBookings, recentEnquiries, monthly, content, activity] = await Promise.all([
    q(`SELECT
         (SELECT count(*) FROM bookings WHERE status = 'new') AS new_bookings,
         (SELECT count(*) FROM bookings) AS all_bookings,
         (SELECT count(*) FROM enquiries WHERE status = 'new') AS new_enquiries,
         (SELECT count(*) FROM reviews WHERE NOT is_approved) AS pending_reviews,
         (SELECT COALESCE(sum(total_amount), 0) FROM bookings WHERE status IN ('confirmed','paid','completed')) AS revenue,
         (SELECT count(*) FROM newsletter_subscribers WHERE unsubscribed_at IS NULL) AS subscribers`),
    q(`SELECT status, count(*)::int AS n FROM bookings GROUP BY status ORDER BY n DESC`),
    q(`SELECT t.title, t.slug, count(b.id)::int AS n FROM bookings b JOIN tours t ON t.id = b.tour_id GROUP BY t.id ORDER BY n DESC LIMIT 5`),
    q(`SELECT b.id, b.reference, b.customer_name, b.status, b.created_at, t.title AS tour FROM bookings b LEFT JOIN tours t ON t.id = b.tour_id ORDER BY b.created_at DESC LIMIT 6`),
    q(`SELECT id, name, kind, status, created_at FROM enquiries ORDER BY created_at DESC LIMIT 6`),
    q(`SELECT to_char(m, 'Mon') AS label, COALESCE(c.n, 0)::int AS n
         FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
         LEFT JOIN (SELECT date_trunc('month', created_at) AS mo, count(*) AS n FROM bookings GROUP BY 1) c ON c.mo = m ORDER BY m`),
    q(`SELECT (SELECT count(*) FROM tours WHERE status = 'published' AND deleted_at IS NULL)::int AS tours,
              (SELECT count(*) FROM destinations WHERE status = 'published' AND deleted_at IS NULL)::int AS destinations,
              (SELECT count(*) FROM accommodations WHERE status = 'published' AND deleted_at IS NULL)::int AS stays,
              (SELECT count(*) FROM posts WHERE status = 'published' AND deleted_at IS NULL)::int AS posts`),
    q(`SELECT a.action, a.entity, a.created_at, u.full_name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 8`),
  ]);
  const maxMonth = Math.max(1, ...monthly.map((m) => m.n));
  res.render('admin/dashboard.njk', { kpi: kpi[0], byStatus, topTours, recentBookings, recentEnquiries, monthly, maxMonth, content: content[0], activity });
}
