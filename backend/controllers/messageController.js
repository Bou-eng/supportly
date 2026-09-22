const Message = require('../models/Message');
const Ticket = require('../models/ticket');

// @desc    Add a message/reply to a ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
const addMessage = async (req, res) => {
  try {
    const { content, type } = req.body;
    const ticketId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find ticket by _id or SUP-XXXX
    let ticket = ticketId.startsWith('SUP-')
      ? await Ticket.findOne({ ticketNumber: ticketId })
      : await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security check: Only allow 'internal' notes if user is an agent/admin/manager
    const messageType = req.user.role === 'customer' ? 'public' : (type || 'public');

    const message = await Message.create({
      ticket: ticket._id,
      author: req.user._id,
      type: messageType,
      content,
    });

    // Populate author details (name, role, email) for response
    await message.populate('author', 'name role email');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages for a ticket
// @route   GET /api/tickets/:id/messages
// @access  Private
const getTicketMessages = async (req, res) => {
  try {
    const ticketId = req.params.id;

    let ticket = ticketId.startsWith('SUP-')
      ? await Ticket.findOne({ ticketNumber: ticketId })
      : await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Query scoping: Customers CANNOT see internal notes
    let query = { ticket: ticket._id };
    if (req.user.role === 'customer') {
      query.type = 'public';
    }

    const messages = await Message.find(query)
      .populate('author', 'name role email')
      .sort({ createdAt: 1 }); // Sorted chronologically (oldest to newest)

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMessage,
  getTicketMessages,
};