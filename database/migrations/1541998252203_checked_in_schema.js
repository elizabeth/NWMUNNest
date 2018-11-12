'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CheckedInSchema extends Schema {
  up () {
    this.create('checked_ins', (table) => {
      table.increments();
      table.string('code', 60).references('code').inTable('tickets');
      table.timestamps();
    })
  }

  down () {
    this.drop('checked_ins')
  }
}

module.exports = CheckedInSchema
