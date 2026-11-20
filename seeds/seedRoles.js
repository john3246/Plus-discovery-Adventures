// Seeds roles, permissions and role_permissions. Safe to run repeatedly.
import { pool } from '../src/config/database.js';
import { PERMISSIONS, ROLES } from '../src/modules/auth/permissionData.js';

export async function seedRoles() {
  for (const key of PERMISSIONS) {
    await pool.query('INSERT INTO permissions (key) VALUES ($1) ON CONFLICT (key) DO NOTHING', [key]);
  }
  for (const [name, description, keys] of ROLES) {
    const { rows } = await pool.query(
      `INSERT INTO roles (name, description) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id`, [name, description]);
    const granted = keys === '*' ? PERMISSIONS : keys;
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [rows[0].id]);
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions WHERE key = ANY($2::text[])`, [rows[0].id, granted]);
  }
  console.log(`roles seeded: ${ROLES.length} roles, ${PERMISSIONS.length} permissions`);
}

if (process.argv[1]?.endsWith('seedRoles.js')) {
  seedRoles().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
}
