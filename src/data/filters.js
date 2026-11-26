// Safari filter options. A trip matches a style by its own style or by what its title says it is.
export const STYLE_FILTERS = [
  ['joining', 'Joining / shared', /joining|shared/i],
  ['camping', 'Camping & budget', /camping|budget/i],
  ['mid-range', 'Mid-range', /mid.?range/i],
  ['luxury', 'Luxury', /luxury/i],
  ['classic', 'Classic safari', null],
  ['migration', 'Great Migration', /migration/i],
  ['calving', 'Calving season', /calving|ndutu/i],
  ['river-crossing', 'Mara River crossing', /river crossing/i],
  ['fly-in', 'Fly-in safari', /fly.?in/i],
  ['balloon', 'Balloon safari', /balloon/i],
  ['honeymoon', 'Honeymoon', /honeymoon/i],
  ['family', 'Family', /family/i],
  ['cultural', 'Cultural', /cultur|coffee/i],
  ['walking', 'Walking & hiking', /walking|hik/i],
  ['trek', 'Trekking & climbing', /trek|climb|hik/i],
  ['beach', 'Beach', /beach/i],
];

export const CATEGORY_FILTERS = [
  ['safari', 'Safaris'], ['kilimanjaro', 'Kilimanjaro & treks'], ['day-trip', 'Day trips'], ['zanzibar', 'Zanzibar'], ['all', 'All categories'],
];

export function matchesStyle(tour, key) {
  const pattern = STYLE_FILTERS.find(([k]) => k === key)?.[2];
  return tour.style === key || Boolean(pattern?.test(tour.title));
}
