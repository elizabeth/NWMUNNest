'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

const apiPrefix = 'api/v1';

Route.group(() => {
  Route.get('permissions', 'PermissionController.index');
  Route.post('permissions/create', 'PermissionController.create');
}).prefix(apiPrefix);

Route.group(() => {
  Route.get('users', 'UserController.index');
  Route.post('users/register', 'UserController.register');
  Route.post('users/authenticate', 'UserController.authenticate');
}).prefix(apiPrefix);

Route.group(() => {
  Route.get('ticket', 'TicketController.get');
  Route.post('ticket/generate', 'TicketController.generate');
  Route.put('ticket/:id/checkin', 'TicketController.checkin');
}).prefix(apiPrefix).middleware(['auth']);
