// Hero slideshow and rotating words for each destination.
// The photos are stock pictures matched by subject. To use your own, put them in public/img/destinations/
// and replace an entry with its path, for example '/img/destinations/serengeti-1.jpg'.
import { IMG } from './images.js';

const hero = (images, words) => ({ images: images.map((key) => IMG[key]), words });

export const destinationSlides = {
  serengeti: hero(['sunset', 'lions', 'zebras', 'leopard'], ['the Great Migration', 'big cats on the plains', 'endless savannah', 'balloon safaris']),
  ngorongoro: hero(['rhino', 'zebras', 'lions', 'elephant'], ['the crater floor', 'black rhino', 'Maasai culture', 'Olduvai Gorge']),
  tarangire: hero(['elephantPlains', 'elephant', 'giraffe', 'sunset'], ['elephant herds', 'ancient baobabs', 'the Tarangire River', 'walking safaris']),
  'lake-manyara': hero(['elephantsPink', 'lions', 'elephant', 'giraffe'], ['tree-climbing lions', 'flamingos on the lake', 'the groundwater forest', 'the Treetop Walkway']),
  'arusha-national-park': hero(['giraffe', 'zebras', 'elephant', 'kilimanjaro'], ['Mount Meru', 'the Momella Lakes', 'colobus monkeys', 'canoe safaris']),
  'lake-eyasi': hero(['sunset', 'zebras', 'jeep'], ['Hadzabe culture', 'Datoga blacksmiths', 'starry nights']),
  kilimanjaro: hero(['kilimanjaro', 'sunset', 'giraffe'], ['Uhuru Peak', 'five climate zones', 'the Lemosho Route', 'sunrise from the summit']),
  zanzibar: hero(['beach', 'island', 'coast', 'jetty'], ['white sand beaches', 'coral reefs', 'sunset dhow cruises', 'island life']),
  'stone-town': hero(['jetty', 'coast', 'beach'], ['spice tours', 'carved doors', 'evening markets', 'Swahili history']),
  ruaha: hero(['lions', 'elephant', 'sunset'], ['big lion prides', 'the Great Ruaha River', 'wild, quiet country']),
  nyerere: hero(['leopard', 'elephant', 'lions'], ['boat safaris', 'walking trails', 'wild dog country']),
  mikumi: hero(['giraffe', 'zebras', 'leopard'], ['fly-in safaris', 'open floodplains', 'giraffe and buffalo']),
};
