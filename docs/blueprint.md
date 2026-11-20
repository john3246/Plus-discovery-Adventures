# Plus Discovery Adventure – Blueprint

Source: *Plus Discovery Adventure – Technical Specification*. This is the working plan for the scaffold in this folder.

## 1. Stack

Node.js 22 (ES modules) · Express 5 · Nunjucks · Tailwind CSS 4 · PostgreSQL (`pg`, `node-pg-migrate`) · Redis (`ioredis`, BullMQ) · Zod · express-session + argon2 · Vitest/Supertest · Docker Compose + Nginx behind Cloudflare.

> Spec inconsistency to resolve: the stack table says PostgreSQL **18**, the database section says **16**. The scaffold uses 16 in `docker-compose.yml`. Confirm before deploy.

## 2. Architecture

```
Visitor / Staff → Cloudflare (CDN, WAF, SSL) → Nginx (TLS, static, limits)
   → Node web (Express)      Node worker (BullMQ)
        ↓            ↓                 ↓
   PostgreSQL     Redis ←──────────────┘
```

Layers call downward only: **routes → controllers → services → repositories**. SQL lives only in repositories; `req`/`res` only in controllers and middleware. Validators (Zod) and views (Nunjucks) sit beside the layers; background work lives in `jobs/`.

## 3. Folder map

| Path | Purpose |
|---|---|
| `src/server.js`, `worker.js`, `app.js` | Web entry, worker entry, Express builder |
| `src/config/` | env (Zod-validated), pg pool, redis, session, i18n, nunjucks, constants |
| `src/middleware/` | requestId, security headers, rate limit, auth, role, CSRF, validate, language, page cache, upload, 404, errors |
| `src/shared/` | `errors/`, `utils/`, `db/`, `cache/`, `logger.js` – reusable, no module internals |
| `src/modules/<name>/` | 15 feature modules, identical shape (below) |
| `src/jobs/` | email, image, CDN purge, sitemap queues and jobs |
| `src/locales/{en,sw}/` | i18next JSON |
| `src/views/` | `layouts/`, `partials/`, `pages/`, `admin/`, `errors/` |
| `public/` | Tailwind output, browser JS modules, images |
| `styles/` | Tailwind input + component CSS |
| `migrations/`, `seeds/` | 15 migrations (up + down), seed scripts |
| `tests/` | `unit/`, `integration/`, `security/`, `e2e/` |
| `scripts/` | backup, restore, file-size check, createAdmin |
| `nginx/`, `Dockerfile`, `docker-compose.yml` | Deployment |

Module shape (`modules/tours/` is the reference):
`index.js` · `<m>.routes.public.js` · `<m>.routes.admin.js` · `controllers/` · `services/` · `repositories/` · `validators/`.

Modules: auth, users, tours, destinations, accommodations, bookings, enquiries, blog, pages, media, reviews, settings, search, dashboard, audit.

## 4. Engineering rules (enforced)

1. One exported function per file, named after the file.
2. Files: warn at 200 lines, fail at 350 (`npm run check:size`, ESLint `max-lines`).
3. Functions ≤ 40 lines, ≤ 4 parameters.
4. No SQL outside repositories; no `req`/`res` outside controllers/middleware.
5. Modules import each other only through `index.js`.
6. Long lists go in data files, not logic.

## 5. Request lifecycle

Cloudflare cache → Express global middleware (requestId, logging, helmet, compression, session, language) → route middleware in order **rateLimit → auth → role → CSRF → validate** → one controller → one service (Redis first, then repositories; transaction for writes) → write clears Redis keys and queues side effects → render view or JSON → `errorHandler`.

## 6. Data model (15 migrations)

001 extensions/enums · 002 users & roles · 003 media · 004 destinations · 005 tours (+ join tables, price tiers) · 006 itinerary days · 007 accommodations · 008 bookings + events · 009 enquiries + newsletter · 010 blog · 011 pages & settings · 012 reviews · 013 translations · 014 audit log + content versions · 015 search/trigram indexes.

Conventions: UUID ids, `created_at`/`updated_at`, content tables add `status`, `deleted_at`, `created_by`/`updated_by`; money as integer minor units + currency.

## 7. Redis

All keys prefixed `tour:`, all with TTL. Sessions 8 h idle · login throttle 15 min · page HTML 10 min · lists 5 min · items 15 min · settings 1 h · stats 2 min. Only anonymous GETs are page-cached; invalidate by `SCAN` prefix, never `KEYS`. Redis down → fall back to PostgreSQL; admin login throttling fails closed.

## 8. Surface area

- **Public pages** under `/{lang}/…`: home, destinations, tours, book, confirmation, accommodations, gallery, blog, about, contact, search, terms, privacy; plus `/sitemap.xml`, `/robots.txt`.
- **Auth pages**: `/admin/login`, `forgot-password`, `reset-password/:token`, `accept-invite/:token`.
- **Admin pages**: dashboard, tours, destinations, accommodations, posts, pages, bookings, enquiries, media, reviews, users/roles, settings, audit log, profile.
- **API** `/api/v1` (auth, public, `/admin/*` with `resource:action` permissions), `/healthz`, `/readyz`.

Templates are already stubbed in `src/views/` to match this list.

## 9. Security checklist (must be true before launch)

- [ ] argon2id, ≥12-char passwords, breached-password check, generic login errors
- [ ] Login throttle 5/15 min per account+IP, 15-min lock
- [ ] Redis sessions, `__Host-` HttpOnly Secure SameSite=Lax cookie, regenerate on login
- [ ] CSRF on every POST/PUT/PATCH/DELETE
- [ ] Parameterised SQL; ORDER BY/columns from allowlists
- [ ] CSP with nonces, sanitised rich text, Nunjucks autoescape
- [ ] Deny-by-default role checks; Zod strips unknown fields
- [ ] Uploads: 8 MB cap, magic-byte check, sharp re-encode, random names
- [ ] Turnstile + honeypot + rate limit on public forms
- [ ] Helmet headers, HSTS preload, TLS ≥ 1.2, Cloudflare Full (Strict)
- [ ] `.env` validated at boot, never committed
- [ ] Audit log on every admin write; soft delete
- [ ] Only 80/443/SSH exposed; DB and Redis on private network
- [ ] Nightly encrypted backup, quarterly restore test
- [ ] Recommended: TOTP for Manager/Super admin, `/admin` IP allowlist, new-login alert

## 9b. Build order (14 days)

| Days | Deliver |
|---|---|
| 1–3 | config, database, migrations, auth |
| 4–6 | shared utils, admin shell, tours / destinations / media modules |
| 7–8 | public layouts and pages |
| 9 | bookings, enquiries, email queue |
| 10 | dashboard, audit log, settings |
| 11 | i18n (EN/SW) and SEO |
| 12–13 | content, polish, tests, security review |
| 14 | deployment and handover |

## 10. Status of this scaffold

| Area | State |
|---|---|
| Folder tree, module shape, all 15 modules | Created (stubs throw `Not implemented`) |
| `config/env.js`, `database.js`, `redis.js`, `withTransaction`, cache helpers, errors, `validate`, `paginate` | Implemented |
| Tours list path (repository → service → controller → route → validator) | Implemented from spec (route not yet mounted in `app.js`) |
| Layouts, partials, page/admin templates | Skeleton only |
| Migrations 001–015 | Empty `up`/`down` – tables still to write |
| Middleware (auth, CSRF, rate limit, headers, cache…) | No-op placeholders |
| Tailwind input, Dockerfile, compose, Nginx, ESLint, size checker | Ready |
| Dependencies | Not installed (`npm install` not run) |

## 11. Next steps

1. `cp .env.example .env`, then `npm install`.
2. Write migrations 001–002, run `npm run migrate up`, implement auth + session + CSRF.
3. Mount `app.js` (middleware order from §5), add `/healthz` and `/readyz`.
4. Build the admin shell layout and the tours admin CRUD as the reference for the other modules.
5. Replace stub templates with real design once branding (logo, colours) is supplied.

## 12. Public site build (design blend)

Layout and homepage order follow Suricata Safaris (hero, why-us, top packages, style rows, migration banner, Kilimanjaro, day trips, travel guide, reviews, enquiry). UI follows Tanzania Specialist (planner widget in hero, trip cards with "From $X", filter panel, anchor-nav trip page, price table, itinerary, Request CTA). Destinations and package set follow GM Safaris (13 Tanzania destinations, safari and Kilimanjaro packages). Logo: `public/img/logo.png`. Images: Unsplash, ids in `src/data/images.js`.

Run: `npm run build:css`, then `PORT=3100 node src/server.js`.

| Path (prefix `/en` or `/sw`) | Page |
|---|---|
| `/` | Home |
| `/safaris` `/kilimanjaro` `/day-trips` `/zanzibar` | Category lists (filters: style, duration, max price, sort) |
| `/tours`, `/tours/:slug` | All trips, trip detail |
| `/destinations`, `/destinations/:slug` | Destinations |
| `/accommodations`, `/accommodations/:slug` | Stays |
| `/book/:slug` (GET, POST), `/booking/confirmation/:reference` | Booking request |
| `/plan-your-trip` (GET, POST) | Travel proposal form |
| `/contact` (GET, POST), `/newsletter` (POST) | Contact, newsletter |
| `/gallery` `/blog` `/blog/:slug` `/blog/category/:c` | Gallery, blog |
| `/about` `/reviews` `/faqs` `/travel-guide` `/search?q=` `/terms` `/privacy` | Info pages |
| `/sitemap.xml` `/robots.txt` `/healthz` | System |

**Interim state:** content comes from `src/data/*` (sample data, not the database). Form submissions append to `var/submissions.jsonl`. Not yet built: CSRF, Turnstile, rate limits, email queue, admin, Swahili content (nav only), per-page SEO meta/JSON-LD. Placeholders to replace: prices, package copy, lodge names, reviews, phone/email, terms and privacy text.
