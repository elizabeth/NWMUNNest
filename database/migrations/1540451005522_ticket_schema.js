'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TicketSchema extends Schema {
  up () {
    this.create('tickets', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').unique();
      table.string('code', 60).notNullable();
      table.integer('quantity').notNullable();
      table.boolean('checked_in').notNullable().defaultTo(0);
      table.timestamps()
    });
  }

  down () {
    this.drop('tickets')
  }
}

module.exports = TicketSchema;
