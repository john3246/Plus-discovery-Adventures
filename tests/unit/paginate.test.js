import { describe, it, expect } from 'vitest';
import { paginate } from '../../src/shared/utils/paginate.js';

describe('paginate', () => {
  it('computes offset', () => {
    expect(paginate({ page: 3, pageSize: 10 }).offset).toBe(20);
  });
});
