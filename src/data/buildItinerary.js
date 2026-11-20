import { findDestination } from './destinations.js';

/** Generates a placeholder day-by-day plan from a tour's stops. Replace with real itineraries via the admin. */
export function buildItinerary(tour) {
  const names = tour.stops.map((s) => findDestination(s)?.name ?? s);
  if (tour.days === 1) {
    return [{ day: 1, title: names[0], text: `Pick-up in the morning, a full day exploring ${names[0]}, and return to your hotel in the evening.` }];
  }
  const days = [{ day: 1, title: 'Arrival and welcome', text: 'Meet your guide, transfer to your first night\'s stay and brief the trip.' }];
  const middle = tour.days - 2;
  for (let i = 0; i < middle; i += 1) {
    const place = names[Math.min(Math.floor((i * names.length) / middle), names.length - 1)];
    days.push({ day: i + 2, title: place, text: `Full day in ${place}: game drives or activities, with a lodge or camp stay nearby.` });
  }
  days.push({ day: tour.days, title: 'Departure', text: 'Breakfast, final drive and transfer to the airport or your next destination.' });
  return days;
}

export const INCLUDED = ['Park and conservation fees', 'Accommodation as described', 'Meals as stated', 'Driver-guide and 4x4 vehicle', 'Airport transfers', 'Bottled water on game drives'];
export const EXCLUDED = ['International flights', 'Visas', 'Travel insurance', 'Tips', 'Personal items'];
