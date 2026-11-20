import { IMG } from './images.js';

// PLACEHOLDER content: replace accommodation names, posts and reviews with real material before launch.
export const accommodations = [
  { slug: 'serengeti-plains-camp', name: 'Serengeti Plains Camp', type: 'Tented camp', tier: 'mid-range', destination: 'serengeti', image: IMG.lodge, priceRange: '$$', amenities: ['En-suite tents', 'Restaurant', 'Game drives from camp'], description: 'A comfortable mid-range tented camp in the central Serengeti.' },
  { slug: 'ngorongoro-rim-lodge', name: 'Ngorongoro Rim Lodge', type: 'Lodge', tier: 'mid-range', destination: 'ngorongoro', image: IMG.rhino, priceRange: '$$', amenities: ['Crater-rim views', 'Restaurant and bar', 'Fireplace lounge'], description: 'A lodge on the crater rim with early access to the descent road.' },
  { slug: 'tarangire-baobab-camp', name: 'Tarangire Baobab Camp', type: 'Tented camp', tier: 'camping', destination: 'tarangire', image: IMG.elephantPlains, priceRange: '$', amenities: ['Shared facilities', 'Campfire dinners'], description: 'A simple camp among baobabs on the edge of the park.' },
  { slug: 'serengeti-luxury-safari-camp', name: 'Serengeti Luxury Safari Camp', type: 'Luxury camp', tier: 'luxury', destination: 'serengeti', image: IMG.sunset, priceRange: '$$$$', amenities: ['Private veranda', 'Plunge pool', 'Sundowner deck'], description: 'A small luxury camp with private guides and bush dining.' },
  { slug: 'lake-manyara-escarpment-lodge', name: 'Lake Manyara Escarpment Lodge', type: 'Lodge', tier: 'mid-range', destination: 'lake-manyara', image: IMG.elephantsPink, priceRange: '$$', amenities: ['Rift Valley views', 'Pool', 'Restaurant'], description: 'A lodge overlooking the lake from the escarpment.' },
  { slug: 'zanzibar-beach-resort', name: 'Zanzibar Beach Resort', type: 'Beach resort', tier: 'beach', destination: 'zanzibar', image: IMG.beach, priceRange: '$$$', amenities: ['Beachfront', 'Spa', 'Dive centre'], description: 'A beachfront resort on the east coast of Zanzibar.' },
  { slug: 'ngorongoro-crater-camping-site', name: 'Ngorongoro Crater Camping Site', type: 'Camping', tier: 'camping', destination: 'ngorongoro', image: IMG.rhino, priceRange: '$', amenities: ['Rim camping', 'Hot showers', 'Cook tent'], description: 'A simple rim campsite with early access to the crater road.' },
  { slug: 'serengeti-public-campsite', name: 'Serengeti Public Campsite', type: 'Camping', tier: 'camping', destination: 'serengeti', image: IMG.zebras, priceRange: '$', amenities: ['Dome tents', 'Shared facilities', 'Campfire evenings'], description: 'Wake up to zebra grazing beside the tents.' },
  { slug: 'ruaha-river-camp', name: 'Ruaha River Camp', type: 'Tented camp', tier: 'mid-range', destination: 'ruaha', image: IMG.lions, priceRange: '$$$', amenities: ['River views', 'Walking safaris', 'Open-air dining'], description: 'A remote riverside camp for the big lion country of Ruaha.' },
  { slug: 'ngorongoro-crater-luxury-lodge', name: 'Ngorongoro Crater Luxury Lodge', type: 'Luxury lodge', tier: 'luxury', destination: 'ngorongoro', image: IMG.lodge, priceRange: '$$$$', amenities: ['Crater-view suites', 'Spa', 'Butler service'], description: 'Suites perched on the rim with sweeping crater views.' },
  { slug: 'tarangire-treetop-luxury-camp', name: 'Tarangire Treetop Luxury Camp', type: 'Luxury camp', tier: 'luxury', destination: 'tarangire', image: IMG.elephant, priceRange: '$$$$', amenities: ['Raised tents', 'Private deck', 'Bush dinners'], description: 'Elevated tents among baobabs with elephants passing below.' },
  { slug: 'stone-town-heritage-hotel', name: 'Stone Town Heritage Hotel', type: 'Boutique hotel', tier: 'beach', destination: 'stone-town', image: IMG.jetty, priceRange: '$$$', amenities: ['Rooftop terrace', 'Old Town location', 'Swahili breakfast'], description: 'A restored house in the heart of Stone Town.' },
  { slug: 'nungwi-beach-villas', name: 'Nungwi Beach Villas', type: 'Beach villas', tier: 'beach', destination: 'zanzibar', image: IMG.island, priceRange: '$$$$', amenities: ['Private pool', 'Beach access', 'Sunset dhow trips'], description: 'Private villas on the northern tip of Zanzibar.' },
];

export const posts = [
  { slug: 'best-time-to-visit-tanzania', title: 'Best Time to Visit Tanzania', category: 'Travel guide', date: '2026-03-12', image: IMG.jeep, excerpt: 'A month-by-month look at weather, wildlife and crowds.',
    body: ['Tanzania has two dry seasons and two rainy seasons. June to October is the classic safari window, with clear skies and animals gathering at water.', 'January and February are warm and green, and the southern Serengeti hosts the calving season. April and May are the long rains, with quiet parks and lower rates.', 'Kilimanjaro is best climbed in the dry months, January to March and June to October.'] },
  { slug: 'great-migration-explained', title: 'The Great Migration Explained', category: 'Wildlife', date: '2026-02-04', image: IMG.zebras, excerpt: 'Where the herds are each month, and how to plan around them.',
    body: ['More than a million wildebeest and hundreds of thousands of zebra move in a loop around the Serengeti-Mara ecosystem.', 'Calving takes place in the southern plains from late January. The herds head north and west through the middle of the year and cross the Mara River from July to September.', 'We recommend choosing your camp location by month, not by park name.'] },
  { slug: 'kilimanjaro-route-guide', title: 'Choosing a Kilimanjaro Route', category: 'Trekking', date: '2026-01-18', image: IMG.kilimanjaro, excerpt: 'Machame, Lemosho, Marangu or Rongai: how to pick.',
    body: ['Longer routes give your body more time to adapt to altitude and have higher summit success rates.', 'Lemosho and Machame are popular for scenery. Marangu is the only hut route. Rongai approaches from the drier north.', 'Whatever you choose, pack layers and go slowly.'] },
  { slug: 'what-to-pack-for-safari', title: 'What to Pack for a Tanzania Safari', category: 'Travel guide', date: '2025-12-02', image: IMG.giraffe, excerpt: 'Neutral colours, layers and the small things people forget.',
    body: ['Pack neutral colours, a warm layer for early mornings, a hat and sunscreen.', 'Bring binoculars, a dust-proof camera bag and any prescription medication.', 'Soft bags are easier to load into a safari vehicle than hard suitcases.'] },
];

export const reviews = [
  { author: 'Sample traveller', country: 'United Kingdom', rating: 5, source: 'Sample', text: 'Placeholder review: replace with an approved customer review.' },
  { author: 'Sample traveller', country: 'Germany', rating: 5, source: 'Sample', text: 'Placeholder review: replace with an approved customer review.' },
  { author: 'Sample traveller', country: 'United States', rating: 5, source: 'Sample', text: 'Placeholder review: replace with an approved customer review.' },
];

export const gallery = [IMG.jeep, IMG.sunset, IMG.giraffe, IMG.rhino, IMG.kilimanjaro, IMG.beach, IMG.elephantsPink, IMG.jetty, IMG.elephant, IMG.lions, IMG.leopard, IMG.zebras];

export const faqs = [
  ['When is the best time to go on safari?', 'June to October is the dry season and best for game viewing. The Great Migration moves through the year, so we match your dates to the right area.'],
  ['Are your safaris private or shared?', 'Both. Joining (shared) departures run on set dates and private trips can start any day.'],
  ['Do I need a visa?', 'Most visitors need a visa for Tanzania. Check current requirements before travel.'],
  ['What is included in the price?', 'Park fees, accommodation, meals as stated, a driver-guide and transfers. International flights and insurance are not included.'],
  ['How do I book?', 'Send a trip request. We reply with a tailored proposal and confirm after a deposit.'],
];

export const findAccommodation = (slug) => accommodations.find((a) => a.slug === slug);
export const findPost = (slug) => posts.find((p) => p.slug === slug);
