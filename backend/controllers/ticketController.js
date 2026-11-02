const Ticket = require('../models/ticket');
const Category = require('../models/Category');
const Team = require('../models/Team');
const User = require('../models/user');
const createActivityLog = require('../utils/createActivityLog'); 
const createNotification = require('../utils/createNotification');
const resolveReference = require('../utils/resolveReference');
const findTicket = require('../utils/findTicket');
const { canAccessTicket, referenceId, ticketScopeForUser } = require('../utils/ticketAccess');
const { TICKET_PRIORITIES, TICKET_STATUSES } = require('../constants/apiConstants');

const populateTicket = (query) => query
  .populate('user', 'name email role team')
  .populate('assignedTo', 'name email role team')
  .populate('category', 'name description')
  .populate('team', 'name description');

const populateTicketDocument = (ticket) => ticket.populate([
  { path: 'user', select: 'name email role team' },
  { path: 'assignedTo', select: 'name email role team' },
  { path: 'category', select: 'name description' },
  { path: 'team', select: 'name description' },
]);

const getReferenceValue = (ticket, path) => (
  ticket[path]
  || ticket.$errors?.[path]?.value
  || ticket.$errors?.[path]?.properties?.value
  || null
);

const normalizeTicketReferences = async (ticket) => {
  const categoryValue = getReferenceValue(ticket, 'category');
  const teamValue = getReferenceValue(ticket, 'team');

  ticket.category = categoryValue ? await resolveReference(Category, categoryValue) : null;
  ticket.team = teamValue ? await resolveReference(Team, teamValue) : null;
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Customer)
const createTicket = async (req, res) => {
  try {
    const { title, subject, description, contactEmail, priority, category, team } = req.body;
    const ticketTitle = title || subject;

    if (!ticketTitle || !description) {
      return res.status(400).json({ message: 'Please add a title and description' });
    }
    if (priority && !Object.values(TICKET_PRIORITIES).includes(priority)) {
      return res.status(400).json({ message: 'Invalid ticket priority' });
    }

    const categoryId = await resolveReference(Category, category);
    const categoryRecord = categoryId ? await Category.findById(categoryId).select('defaultTeam') : null;
    let requestedTeam = null;
    if (req.user.role === 'admin' && team) requestedTeam = await resolveReference(Team, team);
    if (req.user.role === 'manager' || req.user.role === 'agent') requestedTeam = referenceId(req.user.team);
    const teamId = requestedTeam || categoryRecord?.defaultTeam || null;

    if (category && !categoryId) {
      return res.status(400).json({ message: 'Category not found' });
    }

    if (req.user.role === 'admin' && team && !teamId) {
      return res.status(400).json({ message: 'Team not found' });
    }

    const ticket = await Ticket.create({
      user: req.user._id, // Attached by protect middleware
      title: ticketTitle,
      description,
      contactEmail: contactEmail || req.user.email,
      priority: priority || TICKET_PRIORITIES.MEDIUM,
      category: categoryId,
      team: teamId,
      slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json(await populateTicketDocument(ticket));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tickets with filtering, pagination, and role-based scoping
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    // Build filter query object
    const query = { ...ticketScopeForUser(req.user) };
    const andConditions = [];

    // 1. Role-based scoping
    // 2. Query parameter filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    if (req.query.search) {
      const escapedSearch = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const search = new RegExp(escapedSearch, 'i');
      andConditions.push({
        $or: [{ ticketNumber: search }, { title: search }, { description: search }],
      });
    }

    if (req.query.category) {
      query.category = await resolveReference(Category, req.query.category);
      if (!query.category) return res.status(400).json({ message: 'Category not found' });
    }

    if (req.query.team) {
      query.team = await resolveReference(Team, req.query.team);
      if (!query.team) return res.status(400).json({ message: 'Team not found' });
    }

    // Merge accumulated $or conditions safely
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Execute query with pagination and total count
    const total = await Ticket.countDocuments(query);
    const tickets = await populateTicket(Ticket.find(query))
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
    const ticketQuery = findTicket(ticketId);
    if (!ticketQuery) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const ticket = await populateTicket(ticketQuery);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security check: Only the user who created the ticket can view it
    // (Later we will add logic here so Agents/Admins can view it too)
    if (!canAccessTicket(ticket, req.user)) {
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
    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    const dedicatedWorkflowFields = ['status', 'priority', 'assignedTo'];
    if (dedicatedWorkflowFields.some((field) => Object.hasOwn(req.body, field))) {
      return res.status(400).json({ message: 'Use the dedicated status, priority, or assignment endpoint' });
    }

    // Apply updates sent in request body
    const staffFields = ['category', 'tags', 'slaDueAt'];
    if (req.user.role === 'admin') staffFields.push('team');
    const customerFields = ['title', 'description'];
    const allowedFields = req.user.role === 'customer' ? customerFields : [...customerFields, ...staffFields];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (updates.subject && !updates.title) {
      updates.title = updates.subject;
    }
    delete updates.subject;

    if (updates.category !== undefined) {
      const requestedCategory = updates.category;
      updates.category = await resolveReference(Category, updates.category);
      if (requestedCategory && !updates.category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }
    if (updates.team !== undefined) {
      const requestedTeam = updates.team;
      updates.team = await resolveReference(Team, updates.team);
      if (requestedTeam && !updates.team) {
        return res.status(400).json({ message: 'Team not found' });
      }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    for (const field of ['title', 'description', 'category', 'team', 'tags', 'slaDueAt']) {
      if (updates[field] !== undefined && String(ticket[field]) !== String(updates[field])) {
        await createActivityLog({
          ticketId: ticket._id,
          actorId: req.user._id,
          action: `${field.toUpperCase()}_CHANGE`,
          oldValue: ticket[field],
          newValue: updates[field],
        });
      }
    }

    res.json(await populateTicketDocument(updatedTicket));
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

    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user) || req.user.role === 'customer') {
      return res.status(403).json({ message: 'Not authorized to change ticket status' });
    }
    if (!Object.values(TICKET_STATUSES).includes(status)) {
      return res.status(400).json({ message: 'Invalid ticket status' });
    }

    const oldStatus = ticket.status;
    if (oldStatus === status) return res.json(await populateTicketDocument(ticket));
    ticket.status = status;
    await normalizeTicketReferences(ticket);

    if (status === TICKET_STATUSES.RESOLVED || status === TICKET_STATUSES.CLOSED) {
      ticket.resolvedAt = ticket.resolvedAt || new Date();
    } else {
      ticket.resolvedAt = null;
    }
    if (status === TICKET_STATUSES.CLOSED) {
      ticket.closedAt = ticket.closedAt || new Date();
    } else {
      ticket.closedAt = null;
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

    await createNotification({
      recipientId: ticket.user,
      type: 'STATUS_CHANGE',
      message: `Ticket ${ticket.ticketNumber} status changed to ${status}`,
      ticketId: ticket._id,
    });

    res.json(await populateTicketDocument(ticket));
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

    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user) || req.user.role === 'customer') {
      return res.status(403).json({ message: 'Not authorized to change ticket priority' });
    }
    if (!Object.values(TICKET_PRIORITIES).includes(priority)) {
      return res.status(400).json({ message: 'Invalid ticket priority' });
    }

    const oldPriority = ticket.priority;
    if (oldPriority === priority) return res.json(await populateTicketDocument(ticket));
    ticket.priority = priority;
    await normalizeTicketReferences(ticket);
    await ticket.save();

    // Log Activity
    await createActivityLog({
      ticketId: ticket._id,
      actorId: req.user._id,
      action: 'PRIORITY_CHANGE',
      oldValue: oldPriority,
      newValue: priority,
    });

    res.json(await populateTicketDocument(ticket));
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

    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to assign this ticket' });
    }

    const assignee = assignedTo || null;
    if (assignee) {
      const assignedUser = await User.findById(assignee);
      if (!assignedUser || assignedUser.role !== 'agent' || assignedUser.status !== 'active' || (ticket.team && assignedUser.team?.toString() !== ticket.team.toString())) {
        return res.status(400).json({ message: 'Assignee must belong to the ticket team' });
      }
      if (!ticket.team) ticket.team = assignedUser.team;
    }

    const oldAssignee = ticket.assignedTo ? ticket.assignedTo.toString() : 'unassigned';
    if (oldAssignee === (assignee || 'unassigned')) {
      return res.json(await populateTicketDocument(ticket));
    }
    ticket.assignedTo = assignee;
    await normalizeTicketReferences(ticket);
    await ticket.save();

    // Log Activity
    await createActivityLog({
      ticketId: ticket._id,
      actorId: req.user._id,
      action: 'ASSIGNMENT_CHANGE',
      oldValue: oldAssignee,
      newValue: assignee || 'unassigned',
    });

    if (assignee) {
      await createNotification({
        recipientId: assignee,
        type: 'ASSIGNMENT',
        message: `You were assigned ticket ${ticket.ticketNumber}`,
        ticketId: ticket._id,
      });
    }

    res.json(await populateTicketDocument(ticket));
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
