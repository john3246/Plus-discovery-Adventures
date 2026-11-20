import { pool } from '../config/database.js';

/** Append-only audit trail of admin writes (who, what, before/after, IP). */
export async function recordAudit(req, action, entity, entityId, before = null, after = null) {
  await pool.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, before, after, ip, user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [req.user?.id ?? null, action, entity, entityId ? String(entityId) : null,
      before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, req.ip, String(req.get('user-agent') ?? '').slice(0, 250)]);
}
