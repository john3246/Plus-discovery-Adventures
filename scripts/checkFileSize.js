// Fails if any source file exceeds 350 lines; warns above 200.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SOFT = 200, HARD = 350, EXT = new Set(['.js', '.njk', '.css', '.json']);
let failed = false;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXT.has(extname(p))) continue;
    const lines = readFileSync(p, 'utf8').split('\n').length;
    if (lines > HARD) { console.error(`FAIL ${p}: ${lines} lines`); failed = true; }
    else if (lines > SOFT) console.warn(`WARN ${p}: ${lines} lines`);
  }
}
for (const d of ['src', 'public/js', 'styles', 'migrations', 'scripts', 'tests']) walk(d);
process.exit(failed ? 1 : 0);
