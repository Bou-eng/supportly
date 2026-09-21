const Ticket = require('../models/ticket');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Customer)
const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please add a title and description' });
    }

    const ticket = await Ticket.create({
      user: req.user._id, // Attached by protect middleware
      title,
      description,
      priority: priority || 'medium',
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    // Customers only see their own tickets
    const tickets = await Ticket.find({ user: req.user._id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
};