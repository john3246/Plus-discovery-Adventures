import { Router } from 'express';
import { tours } from '../data/tours.js';
import { destinations } from '../data/destinations.js';
import { posts, accommodations } from '../data/content.js';

export const seoFiles = Router();
const BASE = process.env.APP_URL ?? 'http://localhost:3000';
const STATIC = ['', '/safaris', '/kilimanjaro', '/day-trips', '/zanzibar', '/tours', '/destinations', '/accommodations',
  '/gallery', '/blog', '/about', '/reviews', '/faqs', '/travel-guide', '/contact', '/plan-your-trip', '/terms', '/privacy'];

function urls(lang) {
  return [...STATIC, ...tours.map((t) => `/tours/${t.slug}`), ...destinations.map((d) => `/destinations/${d.slug}`),
    ...accommodations.map((a) => `/accommodations/${a.slug}`), ...posts.map((p) => `/blog/${p.slug}`)].map((u) => `${BASE}/${lang}${u}`);
}

seoFiles.get('/sitemap.xml', (req, res) => {
  const all = ['en'].flatMap(urls);
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`);
});
seoFiles.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${BASE}/sitemap.xml\n`);
});
