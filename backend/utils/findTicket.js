const mongoose = require('mongoose');
const Ticket = require('../models/ticket');

const findTicket = (identifier) => {
  if (identifier.startsWith('SUP-')) {
    return Ticket.findOne({ ticketNumber: identifier });
  }

  if (!mongoose.isValidObjectId(identifier)) {
    return null;
  }

  return Ticket.findById(identifier);
};

module.exports = findTicket;