const canAccessTicket = (ticket, user) => {
  const ownerId = ticket.user?._id || ticket.user;
  const ticketTeam = ticket.team?._id || ticket.team;
  const userTeam = user.team?._id || user.team;
  return user.role === 'admin'
    || ownerId?.toString() === user._id.toString()
    || (['agent', 'manager'].includes(user.role) && ticketTeam && userTeam && ticketTeam.toString() === userTeam.toString());
};
const Message = require('../models/Message');
const Ticket = require('../models/ticket');
const User = require('../models/user');
const findTicket = require('../utils/findTicket');
const createActivityLog = require('../utils/createActivityLog');
const createNotification = require('../utils/createNotification');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { hasValidSignature } = require('../middleware/uploadMiddleware');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// @desc    Add a message/reply to a ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
const addMessage = async (req, res) => {
  try {
    const { content, type } = req.body;
    const ticketId = req.params.id;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find ticket by _id or SUP-XXXX
    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.populate('team', 'name');
    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to access this ticket' });
    }

    // Security check: Only allow 'internal' notes if user is an agent/admin/manager
    const messageType = req.user.role === 'customer' ? 'public' : (type || 'public');

    if (req.files?.length && !isConfigured) {
      return res.status(503).json({ message: 'File uploads are temporarily unavailable' });
    }

    if (req.files?.some((file) => !hasValidSignature(file))) {
      return res.status(400).json({ message: 'Attachment content does not match its file type' });
    }

    const attachments = req.files?.length
      ? await Promise.all(req.files.map(async (file) => {
        const uploaded = await uploadToCloudinary(file, `supportly/tickets/${ticket._id}`);
        return {
          name: file.originalname,
          publicId: uploaded.public_id,
          resourceType: uploaded.resource_type,
          format: uploaded.format || null,
          mimeType: file.mimetype,
          bytes: uploaded.bytes || file.size,
          width: uploaded.width || null,
          height: uploaded.height || null,
        };
      }))
      : [];

    const message = await Message.create({
      ticket: ticket._id,
      author: req.user._id,
      type: messageType,
      content: content || '',
      attachments,
    });

    // Populate author details (name, role, email) for response
    await message.populate('author', 'name role email');

    await createActivityLog({
      ticketId: ticket._id,
      actorId: req.user._id,
      action: messageType === 'internal' ? 'INTERNAL_NOTE_ADDED' : 'MESSAGE_ADDED',
      newValue: messageType,
    });

    if (req.user.role === 'customer') {
      const staff = await User.find({
        role: { $in: ['agent', 'manager', 'admin'] },
        ...(ticket.team ? { team: ticket.team._id || ticket.team } : {}),
        _id: { $ne: req.user._id },
      }).select('_id');
      await Promise.all(staff.map((user) => createNotification({
        recipientId: user._id,
        type: 'NEW_MESSAGE',
        message: `Customer replied to ticket ${ticket.ticketNumber}`,
        ticketId: ticket._id,
      })));
    } else {
      await createNotification({
        recipientId: ticket.user,
        type: 'NEW_MESSAGE',
        message: `New reply on ticket ${ticket.ticketNumber}`,
        ticketId: ticket._id,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttachmentDownloadUrl = async (req, res) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    await ticket.populate('team', 'name');
    if (!canAccessTicket(ticket, req.user)) return res.status(403).json({ message: 'Not authorized to access this ticket' });

    const message = await Message.findOne({ _id: req.params.messageId, ticket: ticket._id });
    const attachment = message?.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });
    if (!isConfigured) return res.status(503).json({ message: 'File storage is not configured' });

    const url = cloudinary.utils.private_download_url(
      attachment.publicId,
      attachment.format || 'bin',
      {
        resource_type: attachment.resourceType,
        type: 'upload',
        attachment: true,
      }
    );
    res.json({ url, expiresIn: 300, name: attachment.name, mimeType: attachment.mimeType });
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

    const ticket = await findTicket(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.populate('team', 'name');
    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to access this ticket' });
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
  getAttachmentDownloadUrl,
};