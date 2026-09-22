const Ticket = require('../models/ticket');

// @desc    Get system-wide summary metrics and status/priority breakdowns
// @route   GET /api/reports/summary
// @access  Private (Manager, Admin)
const getSummaryReport = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: { $ne: 'CLOSED' } });
    const unassignedTickets = await Ticket.countDocuments({ assignedTo: null });

    // Aggregation: Group counts by Status
    const statusBreakdown = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregation: Group counts by Priority
    const priorityBreakdown = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format aggregation arrays into clean key-value objects
    const formattedStatus = statusBreakdown.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const formattedPriority = priorityBreakdown.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      overview: {
        totalTickets,
        openTickets,
        unassignedTickets,
      },
      byStatus: formattedStatus,
      byPriority: formattedPriority,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSummaryReport,
};