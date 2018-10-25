'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Ticket extends Model {
  static get primaryKey () {
    return 'user_id'
  }

  static get incrementing () {
    return false
  }

  users() {
    return this.hasOne('App/Models/Ticket')
  }
}

module.exports = Ticket;
