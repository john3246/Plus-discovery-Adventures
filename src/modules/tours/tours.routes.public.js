import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { pageCache } from '../../middleware/pageCache.js';
import { tourListQuery } from './validators/tourListQuery.js';
import { listToursPage } from './controllers/listToursPage.js';

export const toursPublicRoutes = Router();
toursPublicRoutes.get('/tours', pageCache(600), validate({ query: tourListQuery }), listToursPage);
