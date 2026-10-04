const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['ASSIGNMENT', 'NEW_MESSAGE', 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'TICKET_UPDATE'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);