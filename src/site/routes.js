import { Router } from 'express';
import * as c from './controllers/catalog.js';
import * as p from './controllers/content.js';
import * as f from './controllers/forms.js';

const LANGS = ['en', 'sw'];
export const siteRoutes = Router({ mergeParams: true });

// Language prefix: /en/... or /sw/...; anything else falls through to 404.
siteRoutes.use((req, res, next) => {
  if (!LANGS.includes(req.params.lang)) return next('router');
  res.locals.lang = req.params.lang;
  res.locals.path = req.path;
  res.locals.langs = LANGS;
  return next();
});

siteRoutes.get('/', p.homePage);
for (const key of ['safaris', 'kilimanjaro', 'day-trips', 'zanzibar']) siteRoutes.get(`/${key}`, c.categoryPage(key));
siteRoutes.get('/tours', c.allToursPage);
siteRoutes.get('/tours/:slug', c.tourPage);
siteRoutes.get('/destinations', c.destinationsPage);
siteRoutes.get('/destinations/:slug', c.destinationPage);
siteRoutes.get('/accommodations', c.accommodationsPage);
siteRoutes.get('/accommodations/:slug', c.accommodationPage);
siteRoutes.get('/book/:slug', f.bookForm);
siteRoutes.post('/book/:slug', f.bookSubmit);
siteRoutes.get('/booking/confirmation/:reference', f.confirmationPage);
siteRoutes.get('/plan-your-trip', f.planForm);
siteRoutes.post('/plan-your-trip', f.planSubmit);
siteRoutes.get('/contact', f.contactForm);
siteRoutes.post('/contact', f.contactSubmit);
siteRoutes.post('/newsletter', f.newsletterSubmit);
siteRoutes.get('/gallery', p.galleryPage);
siteRoutes.get('/blog', p.blogPage);
siteRoutes.get('/blog/category/:category', p.blogPage);
siteRoutes.get('/blog/:slug', p.blogPostPage);
siteRoutes.get('/about', p.aboutPage);
siteRoutes.get('/reviews', p.reviewsPage);
siteRoutes.get('/faqs', p.faqsPage);
siteRoutes.get('/travel-guide', p.travelGuidePage);
siteRoutes.get('/search', p.searchPage);
siteRoutes.get('/terms', p.staticPage('pages/terms.njk', 'Terms & Conditions'));
siteRoutes.get('/privacy', p.staticPage('pages/privacy.njk', 'Privacy Policy'));
