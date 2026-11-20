import { listTours } from '../services/listTours.js';

export async function listToursPage(req, res) {
  const data = await listTours(req.validated.query, req.lang);
  res.render('pages/tours/list.njk', { data, query: req.validated.query });
}
