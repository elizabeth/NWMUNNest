'use strict'

// Adonis/Node Dependencies
const Mail = use('Mail');
const Hash = use('Hash');
const QRCode = use('qrcode');
const { validate } = use('Validator');
const Database = use('Database');

// Models
const User = use('App/Models/User');
const Ticket = use('App/Models/Ticket');
const CheckedIn = use('App/Models/CheckedIn');

// ES6 Private Methods
const generateCode = Symbol('generateCode');
const generateQR = Symbol('generateQR');
const generateEmail = Symbol('generateEmail');
const getCheckInLog = Symbol('getCheckInLog');

const HASH_SALT = "nwmunegg";

class TicketController {
  // ES6 Symbolic Private Declaration
  async [generateCode](email) {
    const currentDateTime = Math.round((new Date()).getTime() / 1000);
    const hash = await Hash.make(currentDateTime.toString() + email + HASH_SALT);
    return hash.toString();
  }

  async [generateQR](code) {
    var opts = {
      color: {
        dark: "#323C67"
      }
    };

    try {
      return await QRCode.toDataURL(code, opts);
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async [generateEmail](qr, request) {
    try {
      await Mail.send('emails.ticket', {ticket_quantity: request.input('ticket_quantity'),
        keg_quantity: request.input('keg_quantity')}, (message) => {
        message
          .to(request.input('email'))
          .embed(qr, 'qrCode')
          .subject('[NWMUN-Seattle 2019] Social Ticket')
      })
    } catch(err) {
      console.log(err);
      return null;
    }
  }

  async [getCheckInLog](code) {
    const rawCheckInLog = await Database.table('checked_ins').where('code', code);

    const checkInLog = [];
    rawCheckInLog.map((rawCheckIn) => {
      checkInLog.push(rawCheckIn.created_at);
    });

    return checkInLog;
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

    // Checks if `ticket_quantity_ and `keg_quantity` both == 0
    if (request.input('ticket_quantity') == '0' && request.input('keg_quantity') === '0') {
      return response.status(400).json({
        status: 'Error',
        message: 'Ticket quantity and keg quantity cannot both be 0.'
      });
    }

    const validation = await validate(request.all(), {
      ticket_quantity: 'required',
      keg_quantity: 'required',
      email: 'required'
    });

    if (validation.fails()) {
      return response.status(400).send(validation.messages());
    }

    // Generate Code and QR
    const code = await this[generateCode](request.input('email'));
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
      ticket.ticket_quantity = request.input('ticket_quantity');
      ticket.keg_quantity = request.input('keg_quantity');

      await ticket.save();

      await this[generateEmail](qr, request);

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
    if (ticket.ticket_quantity != 0 && ticket.checked_in >= ticket.ticket_quantity) {
      ticket.check_in_log = await this[getCheckInLog](clientCode);
      return response.status(202).json({
        status: 'Error',
        message: 'Ticket has reached the maximum number of check-ins.',
        data: ticket
      });
    }

    // Checks if the keg tickets are redeemed
    if (ticket.ticket_quantity == 0 && ticket.keg_quantity >= ticket.redeemed_keg_tickets) {
      ticket.check_in_log = await this[getCheckInLog](clientCode);
      return response.status(202).json({
        status: 'Error',
        message: 'Keg tickets have all been redeemed.',
        data: ticket
      });
    }

    try {
      // Adds number of checked in tickets
      if (ticket.ticket_quantity > 0) {
        ticket.checked_in++;
      }

      if (ticket.keg_quantity > 0) {
        ticket.redeemed_keg_tickets = ticket.keg_quantity;
      }

      // Creates entry in CheckedIn
      const checkIn = new CheckedIn();
      checkIn.code = clientCode;

      await checkIn.save();
      await ticket.save();

      // Requeries CheckedIn for log
      ticket.check_in_log = await this[getCheckInLog](clientCode);

      // Returns the ticket
      if (ticket.ticket_quantity == 0) {
        return response.status(200).json({
          message: 'Keg tickets redeemed.',
          data: ticket
        });
      } else if (ticket.redeemed_keg_tickets == 0) {
        return response.status(200).json({
          message: 'User checked in.',
          data: ticket
        });
      } else {
        return response.status(200).json({
          message: 'User checked in and keg tickets redeemed.',
          data: ticket
        });
      }
    } catch(error) {
      console.log(error);
      return response.status(500).json({
        status: 'Error',
        message: 'Internal Server Error. Please check the logs.',
      });
    }
  }
}

module.exports = TicketController;
