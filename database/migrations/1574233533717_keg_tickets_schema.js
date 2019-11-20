'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KegTicketsSchema extends Schema {
  up () {
    this.create('keg_tickets', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('keg_tickets')
  }
}

module.exports = KegTicketsSchema
