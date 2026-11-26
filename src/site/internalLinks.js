// Turns the first mention of a park, route or trip type into an internal link. Used on tour and blog text.
import nunjucks from 'nunjucks';

const TARGETS = [
  ['destinations/serengeti', 'Serengeti National Park|Serengeti'],
  ['destinations/ngorongoro', 'Ngorongoro Conservation Area|Ngorongoro Crater|Ngorongoro'],
  ['destinations/tarangire', 'Tarangire National Park|Tarangire'],
  ['destinations/lake-manyara', 'Lake Manyara National Park|Lake Manyara'],
  ['destinations/arusha-national-park', 'Arusha National Park|Mount Meru'],
  ['destinations/kilimanjaro', 'Mount Kilimanjaro|Kilimanjaro(?! International)'],
  ['destinations/lake-eyasi', 'Lake Eyasi'],
  ['destinations/zanzibar', 'Zanzibar'],
  ['safaris?style=river-crossing', 'Mara River crossings?'],
  ['safaris?style=migration', 'Great Wildebeest Migration|Great Migration'],
  ['safaris?style=calving', 'calving season'],
];

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Returns a per-page linker: each target is linked at most once on the page. */
export function createLinker(lang = 'en') {
  const used = new Set();
  return (text) => {
    const source = String(text ?? '');
    const spans = [];
    for (const [target, pattern] of TARGETS) {
      if (used.has(target)) continue;
      for (const match of source.matchAll(new RegExp(`(?<![\\w-])(?:${pattern})(?![\\w-])`, 'gi'))) {
        const [start, end] = [match.index, match.index + match[0].length];
        if (spans.every((s) => end <= s.start || start >= s.end)) {
          spans.push({ start, end, target });
          used.add(target);
          break;
        }
      }
    }
    let out = '';
    let last = 0;
    for (const s of spans.sort((a, b) => a.start - b.start)) {
      out += `${escape(source.slice(last, s.start))}<a class="inline-link" href="/${lang}/${s.target}">${escape(source.slice(s.start, s.end))}</a>`;
      last = s.end;
    }
    return new nunjucks.runtime.SafeString(out + escape(source.slice(last)));
  };
}
