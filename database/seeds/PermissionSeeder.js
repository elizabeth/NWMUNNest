'use strict'

/*
|--------------------------------------------------------------------------
| PermissionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory');
const Permission = use('App/Models/Permission');

class PermissionSeeder {
  async run () {
    const permissionMap = [];
    permissionMap.push('user');
    permissionMap.push('admin');
    permissionMap.push('root');

    while (permissionMap.length > 0) {
      const permission = new Permission();

      permission.group = permissionMap.pop();
      await permission.save();
    }
  }
}

module.exports = PermissionSeeder
