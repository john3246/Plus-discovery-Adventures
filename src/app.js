// Builds the Express app. Content-driven public site (sample data in src/data) until the DB layer is wired.
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { setupNunjucks } from './config/nunjucks.js';
import { siteRoutes } from './site/routes.js';
import { seoFiles } from './site/seoFiles.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  setupNunjucks(app, join(root, 'src', 'views'));
  app.use(express.static(join(root, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0 }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));
  app.get('/healthz', (req, res) => res.json({ ok: true }));
  app.get('/', (req, res) => res.redirect(302, '/en'));
  app.use(seoFiles);
  app.use('/:lang', siteRoutes);
  app.use((req, res) => res.status(404).render('errors/404.njk', { lang: 'en', path: req.path }));
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(err);
    res.status(500).render('errors/500.njk', { lang: 'en', path: req.path });
  });
  return app;
}
