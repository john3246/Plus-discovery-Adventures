// Package names from the "Draft Safari Packages List". Itineraries and prices for these are still being finalised,
// so they are listed as "price on request". Fully written packages live in packages.json.
import { IMG } from './images.js';

const GROUPS = [
  ['safari', [
    '3 Day Safari & Cultural Experience', '6 Day Wildlife & Cultural Safari', '7 Days Tanzania Wilderness And Cultural Safari',
    '7 Days Cultural Tanzania Camping & Budget Safari', '13 Day Tanzania And Zanzibar Adventure', '6 Days Honeymoon Experience Safari',
    '6 Day Tanzania Family Safari', '5 Day Tanzania Northern Circuit Safari', '5 Day Tanzania Safari Adventure', '7 Day Midrange Tanzania Safari',
    '5 Days Safari to Gombe Stream National Park', '3 Days Tarangire, Ngorongoro & Manyara Safari',
  ]],
  ['kilimanjaro', ['Day Hike Mount Kilimanjaro via Machame Route', '8 Day Trip: Climbing Kilimanjaro', '8 Days Mount Kilimanjaro via Marangu Route']],
  ['safari', [
    '7 Day Serengeti Migration & Zanzibar Honeymoon Safari', '8 Day Luxury Tanzania Safari & Zanzibar Beach Escape', '2 Days Tarangire Ngorongoro Luxury Fly in & out Safari',
    '3 Days Private Luxury Safari Serengeti & Ngorongoro', '4 Days Luxury Safari, Tarangire, Serengeti and Ngorongoro', '4 Day Luxury Tanzania Safari',
    '5 Day Luxury Wildebeest Migration Safari (Serengeti Focus)', '7 Day Luxury Big Five & Wildebeest Migration Safari (From Arusha)', '4 Day Luxury Serengeti Hot Air Balloon Safari',
    '6 Day Luxury Great Migration River Crossing Safari (Northern Serengeti Focus)', '6 Days Tanzania Luxury Experience', '6 Days Tanzania Luxury Adventure Experience',
    '3 Day Serengeti Hot Air Balloon Safari',
  ]],
  ['zanzibar', ['5 Days Zanzibar Beach Holiday', '2 Days Zanzibar Stonetown Special']],
  ['safari', [
    '2 Days Safari From Zanzibar (Tarangire National Park And The Ngorongoro Crater)', '8 Days Wildebeest Migration Safari', '5 Day Great Migration Safari', '3 Day Fly In Serengeti Safari',
    '4 Day Serengeti and Ngorongoro Safari', '4 Day Tanzania Safari: Tarangire, Serengeti & Ngorongoro Crater', '5 Day Serengeti & Ngorongoro Crater Safari', '2 Day Tanzania Express Safari',
    '2 Days Tarangire & Ngorongoro Safari',
  ]],
  ['day-trip', [
    'Day Trip to Materuni Waterfalls and Coffee Tour', 'Day Trip to Mount Meru Waterfalls Hike', 'Fly-In Fly-Out Mikumi National Park Day Trip', 'Day Trip to Mkomazi National Park',
    'Day Trip to Chemka Hot Springs', 'Day Trip to Olmoti and Empakai Crater in Ngorongoro Highlands', 'Day Trip to Arusha National Park', 'Tarangire National Park Day Trip', 'Ngorongoro Crater Day Trip',
  ]],
  ['safari', [
    '4 Days in Arusha National Park', '4 Days Big Tanzania Shared Safari: Serengeti Adventures', '6 Days Migration Western Corridor Serengeti', '6 Days Migration Safari in Ndutu',
    '9 Days Best Tanzania Adventure Safari', '6 Days Walking & Adventure Safari', '3 Days Tarangire National Park And Ngorongoro Crater', '5 Days Budget Tanzania Lodge Safari',
    '8 Days Best Safari To Ruaha And Selous', '10 Days River Crossing & Great Wildebeest Migration Safari', '6 Days Best Tanzania Adventure Safari',
  ]],
];

const STOP_KEYS = [['serengeti', 'serengeti'], ['ngorongoro', 'ngorongoro'], ['tarangire', 'tarangire'], ['manyara', 'lake-manyara'], ['arusha national', 'arusha-national-park'],
  ['meru', 'arusha-national-park'], ['kilimanjaro', 'kilimanjaro'], ['materuni', 'kilimanjaro'], ['stone', 'stone-town'], ['zanzibar', 'zanzibar'], ['ruaha', 'ruaha'],
  ['selous', 'nyerere'], ['mikumi', 'mikumi'], ['ndutu', 'serengeti'], ['olmoti', 'ngorongoro']];
const IMG_KEYS = [['balloon', 'sunset'], ['migration', 'zebras'], ['river crossing', 'zebras'], ['kilimanjaro', 'kilimanjaro'], ['meru', 'kilimanjaro'], ['materuni', 'kilimanjaro'],
  ['stone', 'jetty'], ['zanzibar', 'beach'], ['luxury', 'lodge'], ['tarangire', 'elephantPlains'], ['ngorongoro', 'rhino'], ['manyara', 'elephantsPink'], ['serengeti', 'lions'], ['ruaha', 'lions'], ['mikumi', 'leopard']];
const STYLE_KEYS = [['honeymoon', 'honeymoon'], ['luxury', 'luxury'], ['camping', 'camping'], ['budget', 'camping'], ['midrange', 'mid-range'], ['shared', 'joining'], ['joining', 'joining'],
  ['migration', 'migration'], ['river crossing', 'migration'], ['climb', 'trek'], ['hike', 'trek'], ['cultural', 'cultural'], ['beach', 'beach'], ['stonetown', 'cultural']];

const pick = (keys, text, fallback) => keys.find(([k]) => text.includes(k))?.[1] ?? fallback;

export const draftPackages = GROUPS.flatMap(([category, titles]) => titles.map((title) => {
  const lower = title.toLowerCase();
  const days = Number(lower.match(/^(\d+)/)?.[1] ?? 1);
  const stops = [...new Set(STOP_KEYS.filter(([k]) => lower.includes(k)).map(([, s]) => s))];
  const style = pick(STYLE_KEYS, lower, category === 'day-trip' ? 'cultural' : 'classic');
  const shown = title.replace(/^(\d+) Days?\b/, '$1 Day');
  return { slug: shown.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), title: shown, days, category, style, stops,
    image: IMG[pick(IMG_KEYS, lower, 'jeep')], price: null,
    summary: `${days === 1 ? 'A full-day' : `${days}-day`} Tanzania experience with Plus Discovery Adventure. Ask us for the full itinerary and a price tailored to your dates and group size.` };
}));
