const express = require('express');
const router = express.Router();
const { createTicket,
        getTickets,
        getTicketById,
        updateTicket,
        updateTicketStatus,
        updateTicketPriority, 
        assignTicket
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
// Both routes require a valid JWT token
router.route('/').post(protect, createTicket).get(protect, getTickets);
router.route('/:id').get(protect, getTicketById).patch(protect, updateTicket);
router.route('/:id/status').patch(protect, updateTicketStatus);
router.route('/:id/priority').patch(protect, updateTicketPriority);
router.route('/:id/assign').patch(protect, authorize('agent', 'manager', 'admin'), assignTicket);

module.exports = router;
