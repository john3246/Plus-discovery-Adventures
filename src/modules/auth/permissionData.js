// Permission keys are resource:action. Roles are sets of permissions (no code change for new roles).
const CRUD = ['read', 'create', 'update', 'delete'];
const gen = (resource, actions) => actions.map((a) => `${resource}:${a}`);

export const PERMISSIONS = [
  ...gen('tours', [...CRUD, 'publish']),
  ...gen('destinations', [...CRUD, 'publish']),
  ...gen('accommodations', [...CRUD, 'publish']),
  ...gen('posts', [...CRUD, 'publish']),
  ...gen('bookings', ['read', 'update', 'delete']),
  ...gen('enquiries', ['read', 'update', 'delete']),
  ...gen('reviews', ['read', 'update', 'delete']),
  ...gen('users', CRUD),
  ...gen('settings', ['read', 'update']),
  ...gen('audit', ['read']),
  ...gen('dashboard', ['read']),
];

const content = ['tours', 'destinations', 'accommodations', 'posts'].flatMap((r) => gen(r, [...CRUD, 'publish']));

// [name, description, permissions | '*']
export const ROLES = [
  ['super_admin', 'Full access, including staff management', '*'],
  ['manager', 'Content, bookings, enquiries and reviews', [...content, ...gen('bookings', ['read', 'update']), ...gen('enquiries', ['read', 'update']),
    ...gen('reviews', ['read', 'update']), 'settings:read', 'settings:update', 'audit:read', 'dashboard:read']],
  ['editor', 'Manages website content', [...content, 'reviews:read', 'dashboard:read']],
  ['sales', 'Handles bookings and enquiries', [...gen('bookings', ['read', 'update']), ...gen('enquiries', ['read', 'update']),
    ...gen('reviews', ['read', 'update']), 'tours:read', 'dashboard:read']],
];
