// Creates the database named in DATABASE_URL if it does not exist (connects to the server's "postgres" database).
import pg from 'pg';

const url = new URL(process.env.DATABASE_URL ?? '');
const name = url.pathname.slice(1);
if (!/^[a-z_][a-z0-9_]*$/i.test(name)) throw new Error(`Unsafe or missing database name in DATABASE_URL: "${name}"`);

url.pathname = '/postgres';
const client = new pg.Client({ connectionString: url.toString() });
await client.connect();
const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
if (exists.rowCount) console.log(`database "${name}" already exists`);
else { await client.query(`CREATE DATABASE "${name}"`); console.log(`database "${name}" created`); }
await client.end();
