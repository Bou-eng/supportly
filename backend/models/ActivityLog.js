const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Ticket',
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    action: {
      type: String,
      required: true, // e.g., 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'ASSIGNMENT'
    },
    oldValue: {
      type: String,
      default: null,
    },
    newValue: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);