// Destination guides: loads the generated HTML and tidies it for reading (lists, tables, FAQ accordions).
import { readFileSync } from 'node:fs';
import { headingQuestions } from '../data/headingQuestions.js';

const raw = JSON.parse(readFileSync(new URL('../data/guides.json', import.meta.url), 'utf8'));

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();

const encode = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Rewrites listed headings as questions, in the page and in its contents list. */
function asQuestions(slug, guide) {
  const questions = headingQuestions[slug] ?? {};
  return {
    html: guide.html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/g, (all, level, attrs, text) => {
      const question = questions[decode(text)];
      return question ? `<h${level}${attrs}>${encode(question)}</h${level}>` : all;
    }),
    toc: guide.toc.map((s) => ({ ...s, title: questions[s.title] ?? s.title })),
  };
}

/** "• a • b" inside a table cell becomes a real list. */
const cellLists = (html) => html.replace(/<td>\s*•([^<]*)<\/td>/g, (_, body) => `<td><ul>${body.split('•').map((x) => `<li>${x.trim()}</li>`).join('')}</ul></td>`);

/** A bullet that only introduces the bullets after it ("Key features:") becomes a small label. */
const listLabels = (html) => html
  .replace(/<ul>\n<li>([^<]{3,80}):<\/li>\n/g, '<p class="list-label">$1</p>\n<ul>\n')
  .replace(/<li>([^<]{3,80}):<\/li>\n/g, '</ul>\n<p class="list-label">$1</p>\n<ul>\n')
  .replace(/<ul>\n?<\/ul>\n?/g, '')
  .replace(/<p>Note:/g, '<p class="note">Note:');

/** Questions under "Frequently asked questions" become accordions and are collected for structured data. */
function faqAccordions(html) {
  const faqs = [];
  const block = (level) => new RegExp(`(<h${level}[^>]*>Frequently asked questions</h${level}>)([\\s\\S]*?)(?=<h[2-${level}][ >]|$)`, 'g');
  const accordions = (all, heading, body) => {
    const items = body.split(/(?=<h[3-5]>)/).map((chunk) => {
      const m = chunk.match(/^<h[3-5]>([\s\S]*?)<\/h[3-5]>([\s\S]*)$/);
      if (!m) return chunk;
      faqs.push({ question: decode(m[1]), answer: decode(m[2].replace(/<\/(p|li)>/g, ' </$1>')).replace(/\s+/g, ' ') });
      return `<details class="faq"><summary>${m[1]}</summary>${m[2]}</details>\n`;
    });
    return heading + items.join('');
  };
  const out = html.replace(block(2), accordions).replace(block(3), accordions);
  return { html: out, faqs };
}

export const guides = Object.fromEntries(Object.entries(raw).map(([slug, g]) => {
  const renamed = asQuestions(slug, g);
  const { html, faqs } = faqAccordions(listLabels(cellLists(renamed.html)));
  const words = decode(g.html).split(/\s+/).length;
  return [slug, { ...g, toc: renamed.toc, html, faqs, words, minutes: Math.max(1, Math.round(words / 220)) }];
}));
