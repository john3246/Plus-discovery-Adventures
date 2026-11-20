import { Router } from 'express';
import { adminHeaders, adminSession, can, csrf, flash, loadUser, loginRequired } from './security.js';
import * as auth from './auth.js';
import * as crud from './crud.js';
import * as inbox from './inbox.js';
import * as users from './users.js';
import { dashboardPage } from './dashboard.js';
import { resources } from './resources.js';

export const adminRoutes = Router();

adminRoutes.use((req, res, next) => { Object.assign(res.locals, { resources, adminPath: req.path, can: () => false }); next(); });
adminRoutes.use(adminHeaders, adminSession, csrf, loadUser, flash);

// Public auth pages
adminRoutes.get('/login', auth.loginPage);
adminRoutes.post('/login', auth.loginLimiter, auth.loginSubmit);

// Everything below requires a signed-in user and an explicit permission (deny by default).
adminRoutes.use(loginRequired);
adminRoutes.post('/logout', auth.logout);
adminRoutes.get('/', can('dashboard:read'), dashboardPage);
adminRoutes.get('/profile', auth.profilePage);
adminRoutes.post('/profile/password', auth.changePassword);

adminRoutes.get('/bookings', can('bookings:read'), inbox.listBookings);
adminRoutes.get('/bookings/export.csv', can('bookings:read'), inbox.exportBookings);
adminRoutes.get('/bookings/:id', can('bookings:read'), inbox.showBooking);
adminRoutes.post('/bookings/:id', can('bookings:update'), inbox.updateBooking);
adminRoutes.get('/enquiries', can('enquiries:read'), inbox.listEnquiries);
adminRoutes.get('/enquiries/:id', can('enquiries:read'), inbox.showEnquiry);
adminRoutes.post('/enquiries/:id', can('enquiries:update'), inbox.updateEnquiry);
adminRoutes.get('/reviews', can('reviews:read'), inbox.listReviews);
adminRoutes.post('/reviews/:id/:action', can('reviews:update'), inbox.setReviewApproval);

adminRoutes.get('/users', can('users:read'), users.listUsers);
adminRoutes.get('/users/new', can('users:create'), users.userForm);
adminRoutes.post('/users', can('users:create'), users.saveUser);
adminRoutes.get('/users/:id/edit', can('users:update'), users.userForm);
adminRoutes.post('/users/:id', can('users:update'), users.saveUser);
adminRoutes.get('/settings', can('settings:read'), users.settingsPage);
adminRoutes.post('/settings', can('settings:update'), users.saveSettings);
adminRoutes.get('/audit-log', can('audit:read'), users.auditPage);

// Generic content resources: /admin/tours, /admin/destinations, /admin/accommodations, /admin/posts
const perm = (action) => (req, res, next) => (resources[req.params.resource]
  ? can(`${resources[req.params.resource].perm}:${action}`)(req, res, next) : next('route'));
adminRoutes.get('/:resource', perm('read'), crud.listPage);
adminRoutes.get('/:resource/new', perm('create'), crud.newPage);
adminRoutes.post('/:resource', perm('create'), crud.savePage);
adminRoutes.get('/:resource/:id/edit', perm('update'), crud.editPage);
adminRoutes.post('/:resource/:id', perm('update'), crud.savePage);
adminRoutes.post('/:resource/:id/delete', perm('delete'), crud.deleteRow);
