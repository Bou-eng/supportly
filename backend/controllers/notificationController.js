const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const unread = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('relatedTicket', 'ticketNumber title status')
      .sort({ createdAt: -1 });

    res.json({ notifications, unread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { $set: { isRead: true } });
  res.json({ message: 'Notifications marked as read' });
};

const createNotification = require('../utils/createNotification');


module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};