'use strict'

// Adonis/Node Dependencies
const Mail = use('Mail');
const Hash = use('Hash');
const QRCode = use('qrcode');
const { validate } = use('Validator');

// Models
const User = use('App/Models/User');
const Ticket = use('App/Models/Ticket');

// ES6 Private Methods
const generateCode = Symbol('generateCode');
const generateQR = Symbol('generateQR');
const generateEmail = Symbol('generateEmail');

class TicketController {
  // ES6 Symbolic Private Declaration
  async [generateCode]() {
    const currentDateTime = Math.round((new Date()).getTime() / 1000);
    const hash = await Hash.make(currentDateTime.toString());
    return hash.toString();
  }

  async [generateQR](code) {
      try {
        return await QRCode.toDataURL(code);
      } catch (err) {
        console.error(err);
        return null;
      }
  }

  async [generateEmail](qr, email) {
    try {
      await Mail.send('emails.ticket', {}, (message) => {
        message
          .to(email)
          .from('sg.seattle@nwmun.org')
          .embed(qr, 'qrCode')
          .subject('[NWMUN-Seattle 2018] Social Ticket')
      })
    } catch(err) {
      console.log(err);
      return null;
    }
  }

  async get({request, response, auth}) {
    // Checks if the user exists
    const code = request.input('code');
    if (!code) {
      return response.status(400).json({
        status: 'Error',
        message: 'Code does not exist.'
      });
    }

    // Checks if the code is associated with a ticket
    const ticket = await Ticket.find(code);
    if (!ticket) {
      return response.status(400).json({
        status: 'Error',
        message: 'Code does not have a ticket.'
      });
    }

    return response.status(200).json({
      data: ticket});
  }

  async generate({request, response, auth}) {
    // Checks if the user exists
    const user = await User.find(auth.user.id);
    if (!user) {
      return response.status(400).json({
        status: 'Error',
        message: 'User does not exist.'
      });
    }

    const validation = await validate(request.all(), {
      quantity: 'required',
      email: 'required|unique:tickets'
    });

    if (validation.fails()) {
      return response.status(400).send(validation.messages());
    }

    // Generate Code and QR
    const code = await this[generateCode]();
    if (!code) {
      return response.status(500).json({
        status: 'Error',
        message: 'Code did not generate.'
      });
    }

    const qr = await this[generateQR](code);
    if (!qr) {
      return response.status(500).json({
        status: 'Error',
        message: 'QR did not generate.'
      });
    }

    // Checks if the user has a ticket
    if (await Ticket.find(code)) {
      return response.status(400).json({
        status: 'Error',
        message: 'User already has a ticket.'
      });
    }

    // Generates Ticket
    try {
      const ticket = new Ticket();
      ticket.primaryKeyValue = code;
      ticket.registered_by = user.id;
      ticket.email = request.input('email');
      ticket.quantity = request.input('quantity');

      await ticket.save();

      await this[generateEmail](qr, request.input('email'));

      return response.status(200).json({
        message: 'Ticket created for: ' + request.input('email'),
        data: ticket
      });
    } catch(error) {
      console.log(error);
      return response.status(500).json({
        status: 'Error',
        message: 'Internal Server Error. Please check the logs.'
      });
    }
  }

  async checkin({params, request, response}) {
    const clientCode = request.input('code');

    // Checks if the user exists
    if (!clientCode) {
      return response.status(400).json({
        status: 'Error',
        message: 'Code was not provided.'
      });
    }

    // Checks if the user has a ticket
    const ticket = await Ticket.find(clientCode);
    if (!ticket) {
      return response.status(400).json({
        status: 'Error',
        message: 'Code does not exist'
      });
    }

    // Checks if the user is already checked in
    if (ticket.checked_in >= ticket.quantity) {
      return response.status(400).json({
        status: 'Error',
        message: 'Ticket can no longer be used.'
      });
    }

    try {
      // Adds number of checked in tickets
      ticket.checked_in++;
      await ticket.save();

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
