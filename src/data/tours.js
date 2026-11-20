import { IMG } from './images.js';

// category: safari | kilimanjaro | day-trip | zanzibar
// style: joining | camping | mid-range | luxury | migration | honeymoon | trek | cultural | beach
// PLACEHOLDER content: prices and names are sample data, to be replaced with real packages.
import { destinations } from './destinations.js';

const STYLE_TAG = { camping: ['Budget', 'rose'], 'mid-range': ['Mid Range', 'rose'], luxury: ['Luxury', 'amber'], joining: ['Group Joining', 'sky'],
  migration: ['Great Migration', 'emerald'], honeymoon: ['Honeymoon', 'pink'], trek: ['Trekking', 'emerald'], cultural: ['Cultural', 'amber'], beach: ['Beach', 'sky'] };
const STAY_TAG = { camping: 'Camping', 'mid-range': 'Lodge', luxury: 'Luxury Camp', joining: 'Lodge', migration: 'Lodge', honeymoon: 'Resort', trek: 'Mountain Huts', cultural: 'Day Trip', beach: 'Beach Resort' };
const shortName = (n) => n.replace(/ (National Park|Conservation Area|Archipelago)$/, '').replace(/^Mount /, 'Mt ').replace(/ \(Selous\)/, '');

// SAMPLE ratings/review counts: replace with real figures from reviews once collected.
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const t = (slug, title, category, style, days, price, image, stops, summary) => {
  const h = hash(slug);
  const visit = stops.map((s, i) => ({ name: shortName(destinations.find((d) => d.slug === s)?.name ?? s),
    mark: stops.length > 1 && i === 0 ? 'Start' : stops.length > 1 && i === stops.length - 1 ? 'End' : '' }));
  return { slug, title, category, style, days, price, image, stops, summary, visit,
    nights: Math.max(days - 1, 0), currency: 'USD', featured: false,
    rating: (4.7 + (h % 4) / 10).toFixed(1).replace('.0', ''), reviews: 5 + (h % 12),
    tags: ['Tanzania', style === 'joining' ? 'Group' : 'Private', ...[STYLE_TAG[style]], STAY_TAG[style]] };
};

export const tours = [
  t('1-day-tarangire-day-safari', '1 Day Tarangire Day Safari', 'day-trip', 'joining', 1, 250, IMG.elephantPlains, ['tarangire'], 'A full day among elephants and baobabs, leaving Arusha at sunrise.'),
  t('1-day-ngorongoro-crater-day-trip', '1 Day Ngorongoro Crater Day Trip', 'day-trip', 'joining', 1, 250, IMG.rhino, ['ngorongoro'], 'Descend into the crater for a day of dense wildlife viewing.'),
  t('1-day-lake-manyara-day-trip', '1 Day Lake Manyara Day Trip', 'day-trip', 'joining', 1, 240, IMG.elephantsPink, ['lake-manyara'], 'Forest, flamingos and tree-climbing lions under the Rift escarpment.'),
  t('1-day-arusha-national-park-walking-safari', '1 Day Arusha National Park Walking Safari', 'day-trip', 'cultural', 1, 220, IMG.giraffe, ['arusha-national-park'], 'A ranger-led walk with giraffe, colobus monkeys and Momella Lakes.'),
  t('2-day-tarangire-ngorongoro-joining-safari', '2 Day Tarangire & Ngorongoro Joining Safari', 'safari', 'joining', 2, 500, IMG.jeep, ['tarangire', 'ngorongoro'], 'A short group safari covering two of the northern circuit\'s best parks.'),
  t('3-day-serengeti-ngorongoro-joining-safari', '3 Day Serengeti & Ngorongoro Joining Safari', 'safari', 'joining', 3, 750, IMG.sunset, ['serengeti', 'ngorongoro'], 'The Serengeti plains and the Ngorongoro Crater in a compact group trip.'),
  t('5-day-shared-group-camping-safari', '5 Day Shared Group Camping Safari', 'safari', 'camping', 5, 1250, IMG.zebras, ['tarangire', 'serengeti', 'ngorongoro'], 'Budget-friendly camping through the northern circuit with a small group.'),
  t('5-day-serengeti-ngorongoro-classic-mid-range-safari', '5 Day Serengeti & Ngorongoro Classic Mid Range Safari', 'safari', 'mid-range', 5, 1950, IMG.lions, ['tarangire', 'serengeti', 'ngorongoro'], 'Comfortable lodges and tented camps on a classic northern route.'),
  t('6-day-northern-tanzania-mid-range-safari', '6 Day Northern Tanzania Mid Range Safari', 'safari', 'mid-range', 6, 2300, IMG.elephant, ['lake-manyara', 'serengeti', 'ngorongoro'], 'Lake Manyara, the Serengeti and Ngorongoro at an easy pace.'),
  t('7-day-northern-tanzania-mid-range-safari', '7 Day Northern Tanzania Mid Range Safari', 'safari', 'mid-range', 7, 2800, IMG.giraffe, ['tarangire', 'lake-manyara', 'serengeti', 'ngorongoro'], 'The full northern circuit with extra time in the Serengeti.'),
  t('7-day-northern-circuit-luxury-safari', '7 Day Northern Circuit Luxury Safari', 'safari', 'luxury', 7, 5300, IMG.lodge, ['tarangire', 'serengeti', 'ngorongoro'], 'Drive in, fly out: premium camps, private vehicle and a flexible schedule.'),
  t('10-day-great-wildebeest-migration-safari', '10 Day Great Wildebeest Migration Safari', 'safari', 'migration', 10, 3750, IMG.zebras, ['tarangire', 'lake-eyasi', 'serengeti', 'ngorongoro'], 'Follow the herds, with a cultural stop at Lake Eyasi.'),
  t('4-day-fly-in-serengeti-safari-from-zanzibar', '4 Day Fly In Serengeti Safari from Zanzibar', 'safari', 'luxury', 4, 3000, IMG.leopard, ['zanzibar', 'serengeti'], 'Fly from the coast straight to the Serengeti and back.'),
  t('8-day-safari-and-zanzibar-honeymoon', '8 Day Safari & Zanzibar Honeymoon', 'safari', 'honeymoon', 8, 3400, IMG.beach, ['serengeti', 'ngorongoro', 'zanzibar'], 'Three nights of safari followed by beach time on Zanzibar.'),
  t('6-day-marangu-route-kilimanjaro', '6 Day Marangu Route Kilimanjaro Climb', 'kilimanjaro', 'trek', 6, 1910, IMG.kilimanjaro, ['kilimanjaro'], 'The hut-based "Coca-Cola" route up Africa\'s highest peak.'),
  t('7-day-machame-route-kilimanjaro', '7 Day Machame Route Kilimanjaro Climb', 'kilimanjaro', 'trek', 7, 2762, IMG.kilimanjaro, ['kilimanjaro'], 'The scenic "Whiskey" route with strong acclimatisation.'),
  t('7-day-lemosho-route-kilimanjaro', '7 Day Lemosho Route Kilimanjaro Climb', 'kilimanjaro', 'trek', 7, 2787, IMG.kilimanjaro, ['kilimanjaro'], 'A quiet western approach with high summit success.'),
  t('7-day-rongai-route-kilimanjaro', '7 Day Rongai Route Kilimanjaro Climb', 'kilimanjaro', 'trek', 7, 2762, IMG.kilimanjaro, ['kilimanjaro'], 'Approach from the north through drier, less-crowded country.'),
  t('9-day-northern-circuit-route-kilimanjaro', '9 Day Northern Circuit Route Kilimanjaro Climb', 'kilimanjaro', 'trek', 9, 3452, IMG.kilimanjaro, ['kilimanjaro'], 'The longest route with the best acclimatisation and views.'),
  t('5-day-zanzibar-beach-holiday', '5 Day Zanzibar Beach Holiday', 'zanzibar', 'beach', 5, 1200, IMG.beach, ['stone-town', 'zanzibar'], 'Stone Town, a spice tour and four nights on the coast.'),
  t('3-day-tarangire-ngorongoro-camping-safari', '3 Day Tarangire & Ngorongoro Camping Safari', 'safari', 'camping', 3, 690, IMG.elephantPlains, ['tarangire', 'ngorongoro'], 'A budget camping safari through two classic northern parks.'),
  t('7-day-serengeti-adventure-camping-safari', '7 Day Serengeti Adventure Camping Safari', 'safari', 'camping', 7, 1890, IMG.zebras, ['lake-manyara', 'serengeti', 'ngorongoro'], 'Sleep under the stars in the Serengeti on a private camping trip.'),
  t('8-day-luxury-serengeti-ngorongoro-safari', '8 Day Luxury Serengeti & Ngorongoro Safari', 'safari', 'luxury', 8, 6400, IMG.sunset, ['tarangire', 'serengeti', 'ngorongoro'], 'Premium camps, a private guide and time for a sunrise balloon flight.'),
  t('6-day-great-migration-safari', '6 Day Great Migration Safari', 'safari', 'migration', 6, 2900, IMG.zebras, ['serengeti', 'ngorongoro'], 'A focused trip to meet the herds where they are that month.'),
  t('8-day-northern-serengeti-river-crossing-safari', '8 Day Northern Serengeti River Crossing Safari', 'safari', 'migration', 8, 3950, IMG.lions, ['tarangire', 'serengeti', 'ngorongoro'], 'Time the Mara River crossings from July to September.'),
  t('10-day-luxury-honeymoon-safari-and-beach', '10 Day Luxury Honeymoon Safari & Beach', 'safari', 'honeymoon', 10, 5800, IMG.lodge, ['serengeti', 'ngorongoro', 'zanzibar'], 'Private bush dinners, then a beachfront villa on Zanzibar.'),
  t('5-day-ruaha-wild-safari', '5 Day Ruaha Wild Safari', 'safari', 'mid-range', 5, 2450, IMG.lions, ['ruaha'], 'Remote, uncrowded Ruaha with big lion prides.'),
  t('4-day-nyerere-fly-in-safari', '4 Day Nyerere Fly-In Safari', 'safari', 'mid-range', 4, 2100, IMG.island, ['nyerere'], 'Boat and walking safaris on the Rufiji, flying in from Dar es Salaam.'),
  t('3-day-mikumi-fly-in-safari', '3 Day Mikumi Fly-In Safari', 'safari', 'camping', 3, 1150, IMG.leopard, ['mikumi'], 'A short, practical safari from the coast.'),
  t('4-day-mount-meru-climb', '4 Day Mount Meru Climb', 'kilimanjaro', 'trek', 4, 1450, IMG.giraffe, ['arusha-national-park'], 'A great warm-up climb to 4,566 m with wildlife on the way.'),
  t('7-day-zanzibar-beach-retreat', '7 Day Zanzibar Beach Retreat', 'zanzibar', 'beach', 7, 1900, IMG.jetty, ['stone-town', 'zanzibar'], 'A slow week on the coast with Stone Town and a spice tour.'),
  t('3-day-stone-town-and-spice-tour', '3 Day Stone Town & Spice Tour', 'zanzibar', 'cultural', 3, 520, IMG.coast, ['stone-town'], 'Old Town lanes, markets and a spice plantation visit.'),
  t('4-day-zanzibar-diving-and-snorkelling', '4 Day Zanzibar Diving & Snorkelling', 'zanzibar', 'beach', 4, 980, IMG.island, ['zanzibar'], 'Reef dives and snorkelling trips with a local crew.'),
  t('1-day-materuni-waterfalls-and-coffee-tour', '1 Day Materuni Waterfalls & Coffee Tour', 'day-trip', 'cultural', 1, 120, IMG.kilimanjaro, ['kilimanjaro'], 'Walk to a waterfall on the lower slopes of Kilimanjaro and roast coffee.'),
  t('1-day-lake-eyasi-cultural-visit', '1 Day Lake Eyasi Cultural Visit', 'day-trip', 'cultural', 1, 280, IMG.zebras, ['lake-eyasi'], 'Meet the Hadzabe and Datoga communities around the lake.'),
];

['5-day-serengeti-ngorongoro-classic-mid-range-safari', '7-day-northern-circuit-luxury-safari', '10-day-great-wildebeest-migration-safari']
  .forEach((s) => { tours.find((x) => x.slug === s).featured = true; });

export const findTour = (slug) => tours.find((x) => x.slug === slug);
export const toursByCategory = (c) => tours.filter((x) => x.category === c);
