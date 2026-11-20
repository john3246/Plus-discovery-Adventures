// Persists public form submissions: PostgreSQL when configured, otherwise var/submissions.jsonl.
import { appendFile, mkdir } from 'node:fs/promises';
import { pool } from '../config/database.js';

const SQL = {
  enquiry: (d) => ['INSERT INTO enquiries (kind, name, email, phone, country, message, source_page) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    ['contact', d.name, d.email, d.phone, d.country, d.message, 'contact']],
  'trip-request': (d) => ['INSERT INTO enquiries (kind, name, email, phone, country, message, details, source_page) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    ['trip-request', d.name, d.email, d.phone, d.country, d.message,
      JSON.stringify({ adults: d.adults, children: d.children, arrival: d.arrival, interest: d.interest, duration: d.duration }), 'plan-your-trip']],
  booking: (d) => [`INSERT INTO bookings (reference, tour_id, customer_name, customer_email, customer_phone, country, travel_date, adults, children, message, total_amount)
      VALUES ($1, (SELECT id FROM tours WHERE slug = $2), $3,$4,$5,$6,$7,$8,$9,$10,
              COALESCE((SELECT price_from FROM tours WHERE slug = $2), 0) * ($8 + $9))`,
    [d.ref, d.slug, d.name, d.email, d.phone, d.country, d.travelDate, d.adults, d.children, d.message]],
  newsletter: (d) => ['INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING', [d.email]],
};

export async function saveSubmission(type, data) {
  if (pool) {
    const [sql, params] = SQL[type](data);
    await pool.query(sql, params);
    if (type === 'booking') {
      await pool.query(`INSERT INTO booking_events (booking_id, type, note) SELECT id, 'created', 'Booking request received' FROM bookings WHERE reference = $1`, [data.ref]);
    }
    return;
  }
  await mkdir('var', { recursive: true });
  await appendFile('var/submissions.jsonl', `${JSON.stringify({ type, at: new Date().toISOString(), ...data })}\n`);
}
