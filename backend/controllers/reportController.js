const Ticket = require('../models/ticket');
const Message = require('../models/Message');
const User = require('../models/user');
const { TICKET_STATUSES } = require('../constants/apiConstants');

const getDateRange = (req) => {
  const end = req.query.to ? new Date(req.query.to) : new Date();
  const start = req.query.from ? new Date(req.query.from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const baseMatch = (req, range) => {
  const match = { createdAt: { $gte: range.start, $lte: range.end } };
  if (req.user.role === 'customer') match.user = req.user._id;
  if (req.user.role === 'manager') match.team = req.user.team?._id || req.user.team || null;
  return match;
};

const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
const formatDuration = (milliseconds) => {
  if (!milliseconds) return '0m';
  const minutes = Math.round(milliseconds / 60000);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const getTicketTiming = async (tickets) => Promise.all(tickets.map(async (ticket) => {
  const messages = await Message.find({ ticket: ticket._id, type: 'public' }).sort({ createdAt: 1 }).populate('author', 'role');
  const firstStaffMessage = messages.find((message) => message.author?._id.toString() !== ticket.user.toString() && message.author?.role !== 'customer');
  return {
    firstResponse: firstStaffMessage ? firstStaffMessage.createdAt - ticket.createdAt : null,
    resolution: ticket.resolvedAt ? ticket.resolvedAt - ticket.createdAt : null,
  };
}));

const getSummaryReport = async (req, res) => {
  try {
    const range = getDateRange(req);
    if (!range) return res.status(400).json({ message: 'Invalid date range' });
    const match = baseMatch(req, range);
    const tickets = await Ticket.find(match).select('user status priority assignedTo team createdAt resolvedAt').lean();
    const timings = await getTicketTiming(tickets);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const resolvedToday = tickets.filter((ticket) => ticket.resolvedAt && ticket.resolvedAt >= todayStart).length;
    const byStatus = tickets.reduce((result, ticket) => ({ ...result, [ticket.status]: (result[ticket.status] || 0) + 1 }), {});
    const byPriority = tickets.reduce((result, ticket) => ({ ...result, [ticket.priority]: (result[ticket.priority] || 0) + 1 }), {});
    const firstResponses = timings.filter((timing) => timing.firstResponse !== null).map((timing) => timing.firstResponse);
    const resolutions = timings.filter((timing) => timing.resolution !== null).map((timing) => timing.resolution);
    res.json({
      range: { from: range.start, to: range.end },
      overview: {
        totalTickets: tickets.length,
        openTickets: tickets.filter((ticket) => ![TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED].includes(ticket.status)).length,
        resolvedToday,
        unassignedTickets: tickets.filter((ticket) => !ticket.assignedTo).length,
        averageFirstResponseMs: average(firstResponses),
        averageResolutionMs: average(resolutions),
        averageFirstResponse: formatDuration(average(firstResponses)),
        averageResolutionTime: formatDuration(average(resolutions)),
      },
      byStatus,
      byPriority,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgentPerformance = async (req, res) => {
  try {
    const range = getDateRange(req);
    if (!range) return res.status(400).json({ message: 'Invalid date range' });
    const tickets = await Ticket.find({ ...baseMatch(req, range), assignedTo: { $ne: null } }).select('assignedTo status createdAt resolvedAt').lean();
    const users = await User.find({ _id: { $in: tickets.map((ticket) => ticket.assignedTo) }, role: 'agent' }).select('name email team').populate('team', 'name').lean();
    const agents = users.map((user) => {
      const assigned = tickets.filter((ticket) => ticket.assignedTo.toString() === user._id.toString());
      const resolved = assigned.filter((ticket) => ticket.resolvedAt);
      return { agent: user, assigned: assigned.length, resolved: resolved.length, averageResolution: formatDuration(average(resolved.map((ticket) => ticket.resolvedAt - ticket.createdAt))) };
    });
    res.json({ agents, range: { from: range.start, to: range.end } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamWorkload = async (req, res) => {
  try {
    const range = getDateRange(req);
    if (!range) return res.status(400).json({ message: 'Invalid date range' });
    const rows = await Ticket.aggregate([
      { $match: baseMatch(req, range) },
      { $group: { _id: '$team', total: { $sum: 1 }, open: { $sum: { $cond: [{ $in: ['$status', ['open', 'in-progress']] }, 1, 0] } }, unassigned: { $sum: { $cond: [{ $eq: ['$assignedTo', null] }, 1, 0] } } } },
      { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, teamId: '$_id', teamName: { $ifNull: ['$team.name', 'Unassigned'] }, total: 1, open: 1, unassigned: 1 } },
      { $sort: { total: -1 } },
    ]);
    res.json({ teams: rows, range: { from: range.start, to: range.end } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicketVolume = async (req, res) => {
  try {
    const range = getDateRange(req);
    if (!range) return res.status(400).json({ message: 'Invalid date range' });
    const rows = await Ticket.aggregate([
      { $match: baseMatch(req, range) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', total: 1, resolved: 1 } },
    ]);
    res.json({ volume: rows, range: { from: range.start, to: range.end } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummaryReport, getAgentPerformance, getTeamWorkload, getTicketVolume };
