'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TicketSchema extends Schema {
  up () {
    this.create('tickets', (table) => {
      table.string('code', 60).notNullable().unique();
      table.string('email', 254).notNullable().unique()
      table.integer('registered_by').unsigned().references('id').inTable('users').unique();
      table.integer('quantity').notNullable();
      table.integer('checked_in').notNullable().defaultTo(0);
      table.timestamps()
    });
  }

  down () {
    this.drop('tickets')
  }
}

module.exports = TicketSchema;
