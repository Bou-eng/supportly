const ActivityLog = require('../models/ActivityLog');
const Ticket = require('../models/ticket');
const findTicket = require('../utils/findTicket');

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

    const isAdmin = req.user.role === 'admin';
    const isOwner = ticket.user.toString() === req.user._id.toString();
    const userTeam = req.user.team?._id || req.user.team;
    const isTeamMember = ticket.team && userTeam && ticket.team.toString() === userTeam.toString();
    if (!isAdmin && !isOwner && !isTeamMember) {
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