// Form controllers. Submissions are appended to var/submissions.jsonl until PostgreSQL + the email queue are wired.
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { findTour, tours } from '../../data/tours.js';

const base = {
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(40).optional().default(''),
  country: z.string().trim().max(60).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
  website: z.string().max(0).optional().default(''), // honeypot
};
const enquirySchema = z.object({ ...base, message: z.string().trim().min(5).max(2000) });
const planSchema = z.object({ ...base, adults: z.coerce.number().int().min(1).max(30), children: z.coerce.number().int().min(0).max(20).default(0),
  arrival: z.string().max(20).default(''), interest: z.string().max(40).default(''), duration: z.string().max(20).default('') });
const bookingSchema = z.object({ ...base, adults: z.coerce.number().int().min(1).max(30), children: z.coerce.number().int().min(0).max(20).default(0), travelDate: z.string().min(8).max(20) });

async function save(type, data) {
  await mkdir('var', { recursive: true });
  await appendFile('var/submissions.jsonl', `${JSON.stringify({ type, at: new Date().toISOString(), ...data })}\n`);
}

const reference = () => `PDA-${randomBytes(3).toString('hex').toUpperCase()}`;
const fieldErrors = (r) => Object.fromEntries(Object.entries(r.error.flatten().fieldErrors).map(([k, v]) => [k, v[0]]));

function handler(schema, view, type, done, extra = () => ({})) {
  return async (req, res, next) => {
    const r = schema.safeParse(req.body);
    if (!r.success) return res.status(422).render(view, { values: req.body, errors: fieldErrors(r), ...extra(req) });
    if (r.data.website) return res.redirect(done(req, 'spam')); // bots: pretend success
    const ref = reference();
    try { await save(type, { ref, ...r.data, slug: req.params.slug }); } catch (e) { return next(e); }
    return res.redirect(done(req, ref));
  };
}

export const contactForm = (req, res) => res.render('pages/contact.njk', { values: {}, errors: {}, sent: req.query.sent });
export const contactSubmit = handler(enquirySchema, 'pages/contact.njk', 'enquiry', (req) => `/${req.params.lang}/contact?sent=1`);
export const planForm = (req, res) => res.render('pages/plan.njk', { values: { adults: 2, interest: req.query.interest ?? '' }, errors: {}, sent: req.query.sent });
export const planSubmit = handler(planSchema, 'pages/plan.njk', 'trip-request', (req) => `/${req.params.lang}/plan-your-trip?sent=1`);

export function bookForm(req, res, next) {
  const tour = findTour(req.params.slug);
  if (!tour) return next();
  res.render('pages/booking/form.njk', { tour, values: { adults: 2 }, errors: {} });
}

export function bookSubmit(req, res, next) {
  const tour = findTour(req.params.slug);
  if (!tour) return next();
  return handler(bookingSchema, 'pages/booking/form.njk', 'booking', (rq, ref) => `/${rq.params.lang}/booking/confirmation/${ref}?tour=${tour.slug}`, () => ({ tour }))(req, res, next);
}

export function confirmationPage(req, res) {
  const tour = tours.find((t) => t.slug === req.query.tour);
  res.render('pages/booking/confirmation.njk', { reference: String(req.params.reference).replace(/[^A-Z0-9-]/gi, '').slice(0, 12), tour });
}

export const newsletterSubmit = async (req, res, next) => {
  const r = z.object({ email: z.string().email().max(150) }).safeParse(req.body);
  if (r.success) { try { await save('newsletter', r.data); } catch (e) { return next(e); } }
  return res.redirect(`/${req.params.lang}?subscribed=${r.success ? 1 : 0}`);
};
