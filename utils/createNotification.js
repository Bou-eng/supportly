const Notification = require('../models/Notification');

const createNotification = async ({ recipientId, type, message, ticketId }) => {
  try {
    if (!recipientId) return;

    await Notification.create({
      recipient: recipientId,
      type,
      message,
      relatedTicket: ticketId,
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = createNotification;