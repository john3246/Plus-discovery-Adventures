/** paginate({ page, pageSize }) -> { page, pageSize, limit, offset } */
export function paginate({ page = 1, pageSize = 12 } = {}) {
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
