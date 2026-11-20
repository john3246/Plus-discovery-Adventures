import nunjucks from 'nunjucks';
import { readFileSync } from 'node:fs';
import { unsplash } from '../data/images.js';
import { site, mainNav } from '../data/site.js';

const locales = {};
for (const l of ['en', 'sw']) {
  locales[l] = JSON.parse(readFileSync(new URL(`../locales/${l}/common.json`, import.meta.url), 'utf8'));
}

function lookup(lang, key) {
  const get = (obj) => key.split('.').reduce((o, k) => o?.[k], obj);
  return get(locales[lang]) ?? get(locales.en) ?? key;
}

export function setupNunjucks(app, viewsDir) {
  const env = nunjucks.configure(viewsDir, { autoescape: true, express: app, noCache: process.env.NODE_ENV !== 'production' });
  env.addFilter('unsplash', unsplash);
  env.addFilter('money', (n) => `$${Number(n).toLocaleString('en-US')}`);
  env.addFilter('titleCase', (s) => String(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  env.addFilter('date', (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  env.addGlobal('t', (lang, key) => lookup(lang, key));
  env.addGlobal('site', site);
  env.addGlobal('mainNav', mainNav);
  env.addGlobal('isDev', process.env.NODE_ENV !== 'production');
  env.addGlobal('currentYear', new Date().getFullYear());
}
