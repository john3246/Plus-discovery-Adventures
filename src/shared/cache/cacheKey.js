import { createHash } from 'node:crypto';
import { KEY_PREFIX } from '../../config/constants.js';

/** cacheKey('list', 'tours', 'en', query) -> tour:list:tours:en:<hash> */
export function cacheKey(kind, resource, lang, query = {}) {
  const hash = createHash('sha1').update(JSON.stringify(query)).digest('hex').slice(0, 12);
  return `${KEY_PREFIX}${kind}:${resource}:${lang}:${hash}`;
}
