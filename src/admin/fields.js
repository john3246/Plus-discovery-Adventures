// Parse and validate submitted admin form fields from a resource's field definitions.
export const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

function parseOne(f, raw, optionValues) {
  const str = typeof raw === 'string' ? raw.trim() : '';
  switch (f.type) {
    case 'checkbox': return { value: raw === 'on' };
    case 'number': {
      if (str === '') return f.required ? { error: 'Required' } : { value: null };
      const n = Number(str);
      if (!Number.isInteger(n) || (f.min != null && n < f.min)) return { error: 'Enter a whole number' + (f.min != null ? ` of ${f.min} or more` : '') };
      return { value: n };
    }
    case 'decimal': {
      if (str === '') return { value: null };
      const n = Number(str);
      return n >= 1 && n <= 5 ? { value: Math.round(n * 10) / 10 } : { error: 'Enter a number from 1 to 5' };
    }
    case 'lines': return { value: str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 100) };
    case 'multi': return { value: [].concat(raw ?? []).filter((v) => optionValues.includes(v)) };
    case 'select': {
      if (str === '' && f.nullable) return { value: null };
      return optionValues.includes(str) ? { value: str } : { error: 'Choose a valid option' };
    }
    case 'date': return str === '' ? { value: null } : /^\d{4}-\d{2}-\d{2}$/.test(str) ? { value: str } : { error: 'Use a valid date' };
    default:
      if (f.required && !str) return { error: 'Required' };
      return { value: str.slice(0, f.type === 'textarea' ? 20000 : 300) };
  }
}

/** @returns {{ values: object, errors: object }} */
export function parseFields(fields, body, optionsFor) {
  const values = {};
  const errors = {};
  for (const f of fields) {
    const opts = (optionsFor(f) ?? []).map((o) => (typeof o === 'string' ? o : o.value));
    const r = parseOne(f, body[f.name], opts);
    if (r.error) errors[f.name] = r.error; else values[f.name] = r.value;
  }
  return { values, errors };
}
