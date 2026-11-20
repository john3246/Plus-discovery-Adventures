// TODO: authRequired middleware
export function authRequired() {
  return (req, res, next) => next();
}
