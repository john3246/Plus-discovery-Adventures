import { ValidationError } from '../shared/errors/ValidationError.js';

/** validate({ body, query, params }) -> stores parsed data on req.validated */
export function validate(schemas) {
  return (req, res, next) => {
    req.validated = {};
    for (const [part, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[part]);
      if (!result.success) return next(new ValidationError(result.error.flatten().fieldErrors));
      req.validated[part] = result.data;
    }
    next();
  };
}
