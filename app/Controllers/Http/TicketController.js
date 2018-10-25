'use strict'

const User = use('App/Models/User');
const Ticket = use('App/Models/Ticket');
const Hash = use('Hash');
const { validate } = use('Validator');

const generateCode = Symbol('generateCode');

class TicketController {
  // ES6 Symbolic Private Declaration
  async [generateCode]() {
    const currentDateTime = Math.round((new Date()).getTime() / 1000);
    const hash = await Hash.make(currentDateTime.toString())
    return hash.toString();
  }

  async get({request, response, auth}) {
    // Checks if the user exists
    const user = await User.find(auth.user.id);
    if (!user) {
      return response.status(400).json({
        status: 'Error',
        message: 'User does not exist.'
      });
    }

    // Checks if the user has a ticket
    const ticket = await Ticket.find(user.id);
    if (!ticket) {
      return response.status(400).json({
        status: 'Error',
        message: 'User does not have a ticket.'
      });
    }

    return response.status(200).json(ticket);
  }

  async generate({request, response, auth}) {
    const validation = await validate(request.all(), {
      quantity: 'required'
    });

    if (validation.fails()) {
      return response.status(400).send(validation.messages());
    }

    // Checks if the user exists
    const user = await User.find(auth.user.id);
    if (!user) {
      return response.status(400).json({
        status: 'Error',
        message: 'User does not exist.'
      });
    }

    // Checks if the user has a ticket
    if (await Ticket.find(user.id)) {
      return response.status(400).json({
        status: 'Error',
        message: 'User already has a ticket.'
      });
    }

    // Generates Ticket
    try {
      const ticket = new Ticket();
      ticket.primaryKeyValue = user.id;
      ticket.code = await this[generateCode]();
      ticket.quantity = request.input('quantity');

      await ticket.save();

      return response.status(200).json({
        message: 'Ticket created for: ' + user.email,
        data: ticket
      });
    } catch(error) {
      return response.status(500).json({
        status: 'Error',
        message: 'Internal Server Error. Please check the logs.'
      });
    }
  }

  async checkin({params, request, response}) {
    const user = await User.find(params.id);
    const clientCode = request.input('code');

    // Checks if the user exists
    if (!user) {
      return response.status(400).json({
        status: 'Error',
        message: 'User does not exist.'
      });
    }

    if (!clientCode) {
      return response.status(400).json({
        status: 'Error',
        message: 'Code was not provided.'
      });
    }

    // Checks if the user has a ticket
    const ticket = await Ticket.find(user.id);
    if (!ticket) {
      return response.status(400).json({
        status: 'Error',
        message: 'User does not have a ticket.'
      });
    }

    // Checks if the client ticket code matches the server ticket code
    if (request.input('code') != ticket.code) {
      return response.status(400).json({
        status: 'Error',
        message: 'Ticket validation failed.'
      });
    }

    try {
      // Sets ticket to checked in
      ticket.checked_in = true;
      await ticket.status;

      // Returns the ticket
      return response.status(201).json({
        message: 'User checked in.',
        data: ticket
      })
    } catch(error) {
      return response.status(500).json({
        status: 'Error',
        message: 'Internal Server Error. Please check the logs.'
      });
    }
  }
}

module.exports = TicketController;
