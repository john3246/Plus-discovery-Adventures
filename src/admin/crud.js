// Generic list / create / edit / delete handlers for resources in resources.js.
import { pool } from '../config/database.js';
import { withTransaction } from '../shared/db/withTransaction.js';
import { invalidateStore } from '../site/store.js';
import { recordAudit } from './audit.js';
import { resources } from './resources.js';
import { parseFields, slugify } from './fields.js';
import { relations } from './relations.js';
import { findRow, insertRow, listRows, removeRow, selectOptions, updateRow } from './crudRepo.js';

const PAGE_SIZE = 20;
const cfgOf = (req) => resources[req.params.resource];

async function optionsMap(cfg) {
  const map = {};
  for (const f of cfg.fields) if (f.source) map[f.name] = await selectOptions(f.source);
  return map;
}

/** Row to form values: arrays for list fields become text, relation data is merged in. */
async function toFormValues(cfg, row) {
  const v = { ...row };
  for (const f of cfg.fields) if (f.type === 'lines') v[f.name] = (row[f.name] ?? []).join('\n');
  if (row.published_at) v.published_at = new Date(row.published_at).toISOString().slice(0, 10);
  const rel = relations[cfg.table];
  return rel ? { ...v, ...(await rel.load(pool, row)) } : v;
}

export async function listPage(req, res, next) {
  const cfg = cfgOf(req);
  if (!cfg) return next();
  const page = Math.max(1, Number(req.query.page) || 1);
  const q = String(req.query.q ?? '').trim().slice(0, 80);
  const status = String(req.query.status ?? '');
  const rows = await listRows(cfg, { q, status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const total = Number(rows[0]?.total ?? 0);
  return res.render('admin/list.njk', { cfg, key: req.params.resource, rows, q, status, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), total });
}

export async function newPage(req, res, next) {
  const cfg = cfgOf(req);
  if (!cfg) return next();
  const values = Object.fromEntries(cfg.fields.map((f) => [f.name, f.type === 'select' && f.options ? f.options[0] : f.type === 'multi' ? [] : '']));
  values.status = 'draft';
  return res.render('admin/form.njk', { cfg, key: req.params.resource, values, errors: {}, options: await optionsMap(cfg), isNew: true });
}

export async function editPage(req, res, next) {
  const cfg = cfgOf(req);
  const row = cfg && (await findRow(cfg, req.params.id).catch(() => null));
  if (!row) return next();
  return res.render('admin/form.njk', { cfg, key: req.params.resource, values: await toFormValues(cfg, row), errors: {}, options: await optionsMap(cfg), isNew: false, id: row.id });
}

export async function savePage(req, res, next) {
  const cfg = cfgOf(req);
  if (!cfg) return next();
  const id = req.params.id;
  const before = id ? await findRow(cfg, id).catch(() => null) : null;
  if (id && !before) return next();

  const options = await optionsMap(cfg);
  const { values, errors } = parseFields(cfg.fields, req.body, (f) => f.options ?? options[f.name]);
  if (cfg.fields.some((f) => f.name === 'slug')) values.slug = slugify(values.slug || values[cfg.title] || '');
  if (!values.slug && cfg.fields.some((f) => f.name === 'slug')) errors.slug = 'Required';

  // Publishing needs the publish permission; otherwise keep the current (or draft) status.
  if (cfg.hasStatus && values.status === 'published' && !req.user.perms.has(`${cfg.perm}:publish`)) values.status = before?.status ?? 'draft';
  if (cfg.table === 'posts' && values.status === 'published' && !values.published_at) values.published_at = new Date().toISOString().slice(0, 10);

  const rerender = (extra) => res.status(422).render('admin/form.njk', { cfg, key: req.params.resource, values: { ...req.body, ...values, ...extra },
    errors, options, isNew: !id, id });
  if (Object.keys(errors).length) return rerender({});

  try {
    const savedId = await withTransaction(async (db) => {
      const rowId = id ?? await insertRow(cfg, values, req.user.id, db);
      if (id) await updateRow(cfg, id, values, req.user.id, db);
      await relations[cfg.table]?.save(db, rowId, values);
      return rowId;
    });
    await recordAudit(req, id ? 'update' : 'create', cfg.table, savedId, before, values);
    invalidateStore();
    res.setFlash('ok', `${cfg.singular} saved.`);
    return res.redirect(`/admin/${req.params.resource}/${savedId}/edit`);
  } catch (e) {
    if (e.code === '23505') { errors.slug = 'That URL slug is already used'; return rerender({}); }
    throw e;
  }
}

export async function deleteRow(req, res, next) {
  const cfg = cfgOf(req);
  const before = cfg && (await findRow(cfg, req.params.id).catch(() => null));
  if (!before) return next();
  await removeRow(cfg, before.id, req.user.id);
  await recordAudit(req, 'delete', cfg.table, before.id, before, null);
  invalidateStore();
  res.setFlash('ok', `${cfg.singular} deleted.`);
  return res.redirect(`/admin/${req.params.resource}`);
}
