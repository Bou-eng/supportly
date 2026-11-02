const Notification = require('../models/Notification');
const User = require('../models/user');

const createNotification = async ({ recipientId, type, message, ticketId }) => {
  try {
    if (!recipientId) return;

    const recipient = await User.findById(recipientId).select('notificationPreferences status').lean();
    if (!recipient || recipient.status !== 'active') return;
    const preference = type === 'ASSIGNMENT' ? 'ticketAssigned' : 'ticketUpdated';
    if (recipient.notificationPreferences?.[preference] === false) return;

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
