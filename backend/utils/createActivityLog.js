const ActivityLog = require('../models/ActivityLog');

const createActivityLog = async ({ ticketId, actorId, action, oldValue, newValue }) => {
  try {
    await ActivityLog.create({
      ticket: ticketId,
      actor: actorId,
      action,
      oldValue,
      newValue,
    });
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

module.exports = createActivityLog;