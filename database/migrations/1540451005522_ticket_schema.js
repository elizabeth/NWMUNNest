'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TicketSchema extends Schema {
  up () {
    this.create('tickets', (table) => {
      table.string('code', 60).notNullable().unique();
      table.string('email', 254).notNullable();
      table.integer('registered_by').unsigned().references('id').inTable('users');
      table.integer('ticket_quantity').notNullable();
      table.integer('keg_quantity').notNullable();
      table.boolean('checked_in').defaultTo(false);
      table.timestamps()
    });
  }

  down () {
    this.dropIfExists('tickets')
  }
}

module.exports = TicketSchema;
