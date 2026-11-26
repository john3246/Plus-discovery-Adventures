// Prepares the day-by-day timeline: each day's main destination, photo and activities,
// worked out from the day's own title and text. Nothing is shown that the itinerary or destination data does not say.
import { destinationSlides } from '../data/destinationSlides.js';

const PLACES = [
  ['serengeti', /serengeti|ndutu|seronera|kogatende|mara river/i],
  ['ngorongoro', /ngorongoro|crater/i],
  ['tarangire', /tarangire/i],
  ['lake-manyara', /manyara/i],
  ['lake-eyasi', /eyasi|hadzabe|datoga/i],
  ['arusha-national-park', /arusha national park|momella|mount meru/i],
  ['stone-town', /stone ?town/i],
  ['zanzibar', /zanzibar/i],
];
const ACTIVITIES = [
  [/game drive/i, 'Game drive'],
  [/\bhik(e|ing)\b|\btrek(king)?\b|\bsummit\b/i, 'Hiking and trekking'],
  [/walking safari|guided walk/i, 'Guided walk'],
  [/cultural|village|hadzabe|datoga/i, 'Cultural visit'],
  [/\bfly(ing)? (from|in|into|to|back|straight)\b|\bflight (to|from|back)\b/i, 'Flight'],
  [/waterfall/i, 'Waterfall visit'],
];

/** The place a day is mainly about: the last one named in its title ("Arusha to Tarangire"), else the first in its text. */
function mainPlace(title, text) {
  const inTitle = PLACES.map(([slug, re]) => [slug, title.search(re)]).filter(([, at]) => at >= 0).sort((a, b) => b[1] - a[1]);
  if (inTitle.length) return inTitle[0][0];
  const inText = PLACES.map(([slug, re]) => [slug, text.search(re)]).filter(([, at]) => at >= 0).sort((a, b) => a[1] - b[1]);
  return inText[0]?.[0] ?? null;
}

export function timeline(tour, itinerary, destinations) {
  const seen = new Map();
  let previous = null;
  return itinerary.map((day) => {
    const paragraphs = (Array.isArray(day.text) ? day.text : [day.text]).filter(Boolean);
    const text = paragraphs.join(' ');
    const title = day.title ?? '';
    // Mountain climbs stay on the mountain; "Zanzibar" in a flight's departure point must not win over the park.
    const slug = tour.stops.length === 1 && tour.stops[0] === 'kilimanjaro' ? 'kilimanjaro' : mainPlace(title, text);
    const place = destinations.find((d) => d.slug === slug) ?? null;
    const visit = seen.get(slug) ?? 0;
    if (place) seen.set(slug, visit + 1);
    const photos = destinationSlides[slug]?.images ?? [];
    const changed = Boolean(place) && slug !== previous;
    previous = slug ?? previous;
    return {
      ...day,
      paragraphs,
      place,
      showPanel: changed && visit === 0,
      image: changed && photos.length ? photos[visit % photos.length] : null,
      activities: ACTIVITIES.filter(([re]) => re.test(`${title} ${text}`)).map(([, name]) => name),
    };
  });
}
