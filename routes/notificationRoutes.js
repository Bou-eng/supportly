const express = require('express');
const router = express.Router();
const { getMyNotifications,
        markAsRead 
} = require('../controllers/notificationController');
const createNotification = require('../utils/createNotification');

const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

// backend/routes/notificationRoutes.js

// Keep commented out during normal dev, or uncomment when manually testing notifications
/*
router.post('/test', async (req, res) => { ... });
*/

router.post('/test', async (req, res) => {
  try {
    const { ticketId } = req.body; // Pass any existing Ticket ID from your database
    await createNotification({
      recipientId: req.user._id,
      type: 'STATUS_CHANGE',
      message: 'Test notification: Ticket status updated to IN_PROGRESS',
      ticketId: ticketId,
    });
    res.status(201).json({ message: 'Test notification created!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;