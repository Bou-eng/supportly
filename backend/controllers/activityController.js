const ActivityLog = require('../models/ActivityLog');
const Ticket = require('../models/ticket');
const findTicket = require('../utils/findTicket');
const { canAccessTicket } = require('../utils/ticketAccess');

// @desc    Get activity logs for a specific ticket
// @route   GET /api/tickets/:id/activity
// @access  Private (Agents, Managers, Admins)
const getTicketActivity = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to view ticket activity' });
    }

    const logs = await ActivityLog.find({ ticket: ticket._id })
      .populate('actor', 'name role email')
      .sort({ createdAt: -1 }); // Most recent activity first

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTicketActivity,
};
