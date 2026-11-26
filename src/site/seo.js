// Search and social metadata: absolute canonical URL, robots rules and JSON-LD structured data.
const BASE = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const NO_INDEX = /^\/(search|book\/|booking\/)/;
const isReal = (v) => v && !/example\.com|000 000/.test(v);

export const absolute = (path) => (String(path).startsWith('http') ? path : `${BASE}${path}`);

/** Serialises structured data so page content can never close the script tag. */
export const jsonLd = (data) => JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');

const organisation = (site) => jsonLd({
  '@type': 'TravelAgency', '@id': `${BASE}/#organisation`, name: site.fullName, url: `${BASE}/en`, logo: absolute('/img/logo.png'), image: absolute('/img/logo.png'),
  address: { '@type': 'PostalAddress', addressLocality: 'Arusha', addressCountry: 'TZ' },
  areaServed: 'Tanzania',
  ...(isReal(site.email) && { email: site.email }),
  ...(isReal(site.phone) && { telephone: site.phone }),
});

export const breadcrumbs = (trail) => jsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(path) })),
});

export const faqSchema = (faqs) => jsonLd({
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
});

export const tourSchema = (tour, path, image) => jsonLd({
  '@type': 'TouristTrip', name: tour.title, description: tour.summary, url: absolute(path), image,
  provider: { '@id': `${BASE}/#organisation` },
  ...(tour.itinerary?.length && { itinerary: { '@type': 'ItemList', itemListElement: tour.itinerary.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.title })) } }),
  ...(tour.price && { offers: { '@type': 'Offer', price: tour.price, priceCurrency: 'USD', url: absolute(path) } }),
});

export const destinationSchema = (destination, guide, path, image) => jsonLd({
  '@type': 'TouristDestination', name: destination.name, description: guide?.metaDescription ?? destination.summary, url: absolute(path), image,
});

export const articleSchema = (post, path, image) => jsonLd({
  '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image, datePublished: new Date(post.date).toISOString().slice(0, 10),
  mainEntityOfPage: absolute(path), publisher: { '@id': `${BASE}/#organisation` },
});

/** Copies the rendered title and description into the social tags, so templates define them once. */
export function withSocialTags(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim();
  const description = html.match(/<meta name="description" content="([\s\S]*?)">/)?.[1].trim();
  if (!title || !description) return html;
  return html.replace('</head>', () => `  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">\n  <meta property="og:description" content="${description}">\n</head>`);
}

/** Defaults for every public page; controllers may add to res.locals.schemas. */
export function seoLocals(req, res, next) {
  const clean = req.path === '/' ? '' : req.path.replace(/\/$/, '');
  res.locals.canonical = `${BASE}/${req.params.lang}${clean}`;
  res.locals.baseUrl = BASE;
  // Filtered and transactional pages stay out of the index; their canonical points at the clean URL.
  res.locals.robots = NO_INDEX.test(req.path) || Object.keys(req.query).length ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  res.locals.schemas = [organisation(res.locals.site)];
  const send = res.send.bind(res);
  res.send = (body) => send(typeof body === 'string' && body.includes('</head>') ? withSocialTags(body) : body);
  next();
}
