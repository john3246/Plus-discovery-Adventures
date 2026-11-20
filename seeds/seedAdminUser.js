// Creates the first super admin. Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env; if the password is missing a random
// one is generated and written to var/admin-credentials.txt (git-ignored), never printed.
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { pool } from '../src/config/database.js';
import { env } from '../src/config/env.js';

export async function seedAdminUser() {
  const email = (env.ADMIN_EMAIL ?? 'admin@plusdiscovery.local').toLowerCase();
  const exists = await pool.query('SELECT 1 FROM users WHERE lower(email) = $1', [email]);
  if (exists.rowCount) return console.log(`admin user already exists: ${email}`);

  const generated = !env.ADMIN_PASSWORD;
  const password = env.ADMIN_PASSWORD ?? randomBytes(12).toString('base64url');
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role_id)
     SELECT $1, $2, 'Site Administrator', id FROM roles WHERE name = 'super_admin'`, [email, hash]);

  if (generated) {
    await mkdir('var', { recursive: true });
    await writeFile('var/admin-credentials.txt', `email: ${email}\npassword: ${password}\n`);
    console.log(`admin created: ${email} (generated password saved to var/admin-credentials.txt)`);
  } else console.log(`admin created: ${email}`);
}

if (process.argv[1]?.endsWith('seedAdminUser.js')) {
  seedAdminUser().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
}
