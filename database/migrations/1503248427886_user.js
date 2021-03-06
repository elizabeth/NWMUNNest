'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments();
      table.string('email', 254).notNullable().unique();
      table.string('password', 60).notNullable();
      table.integer('permissions_id').unsigned().references('id').inTable('permissions');
      table.timestamps();
    })
  }

  down () {
    this.dropIfExists('users')
  }
}

module.exports = UserSchema
