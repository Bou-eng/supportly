const Ticket = require('../models/ticket');
const createActivityLog = require('../utils/createActivityLog'); 

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

// @desc    Get tickets with filtering, pagination, and role-based scoping
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query object
    let query = {};

    // 1. Role-based scoping: Customers only see their own tickets
    if (req.user.role === 'customer') {
      query.user = req.user._id;
    }

    // 2. Query parameter filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.team) {
      query.team = req.query.team;
    }

    // Execute query with pagination and total count
    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tickets,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Find ticket by standard MongoDB _id OR custom ticketNumber
    // We use a regex test to see if the param starts with "SUP-"
    let ticket;
    if (ticketId.startsWith('SUP-')) {
      ticket = await Ticket.findOne({ ticketNumber: ticketId });
    } else {
      ticket = await Ticket.findById(ticketId);
    }

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security check: Only the user who created the ticket can view it
    // (Later we will add logic here so Agents/Admins can view it too)
    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } catch (error) {
    // If the provided ID is an invalid MongoDB ObjectId format, it throws a CastError
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket (status, priority, category, etc.)
// @route   PATCH /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Find ticket by standard MongoDB _id OR SUP-XXXX ticketNumber
    let ticket = ticketId.startsWith('SUP-')
      ? await Ticket.findOne({ ticketNumber: ticketId })
      : await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Ownership check (Only the requester can update for now)
    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    // Apply updates sent in request body
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private
// 1. Update Ticket Status
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    let ticket = ticketId.startsWith('SUP-')
      ? await Ticket.findOne({ ticketNumber: ticketId })
      : await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = Date.now();
    }

    await ticket.save();

    // Log Activity
    await createActivityLog({
      ticketId: ticket._id,
      actorId: req.user._id,
      action: 'STATUS_CHANGE',
      oldValue: oldStatus,
      newValue: status,
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket priority
// @route   PATCH /api/tickets/:id/priority
// @access  Private
// 2. Update Ticket Priority
const updateTicketPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const ticketId = req.params.id;

    let ticket = ticketId.startsWith('SUP-')
      ? await Ticket.findOne({ ticketNumber: ticketId })
      : await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldPriority = ticket.priority;
    ticket.priority = priority;
    await ticket.save();

    // Log Activity
    await createActivityLog({
      ticketId: ticket._id,
      actorId: req.user._id,
      action: 'PRIORITY_CHANGE',
      oldValue: oldPriority,
      newValue: priority,
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign ticket to an agent or team
// @route   PATCH /api/tickets/:id/assign
// @access  Private (Agent/Admin/Manager only)
// 3. Assign Ticket
const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticketId = req.params.id;

    let ticket = ticketId.startsWith('SUP-')
      ? await Ticket.findOne({ ticketNumber: ticketId })
      : await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldAssignee = ticket.assignedTo ? ticket.assignedTo.toString() : 'unassigned';
    ticket.assignedTo = assignedTo;
    await ticket.save();

    // Log Activity
    await createActivityLog({
      ticketId: ticket._id,
      actorId: req.user._id,
      action: 'ASSIGNMENT_CHANGE',
      oldValue: oldAssignee,
      newValue: assignedTo,
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority
};