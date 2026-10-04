const express = require('express');
const router = express.Router();
const { createTicket,
        getTickets,
        getTicketById,
        updateTicket,
        updateTicketStatus,
        updateTicketPriority, 
        assignTicket, 
} = require('../controllers/ticketController');

const { 
  addMessage, 
  getTicketMessages 
} = require('../controllers/messageController');
const { getAttachmentDownloadUrl } = require('../controllers/messageController');
const { upload } = require('../middleware/uploadMiddleware');

const { getTicketActivity } = require('../controllers/activityController'); 

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');
// Both routes require a valid JWT token.
// Customers, agents, managers, and admins can create tickets; ownership and team access remain enforced elsewhere.
router.route('/').post(protect, createTicket).get(protect, getTickets);
router.route('/:id').get(protect, getTicketById).patch(protect, updateTicket);
router.route('/:id/status').patch(protect, updateTicketStatus);
router.route('/:id/priority').patch(protect, updateTicketPriority);
router.route('/:id/assign').patch(protect, authorize(USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN), assignTicket);

router.route('/:id/messages')
  .post(protect, upload.array('attachments', 5), addMessage)
  .get(protect, getTicketMessages);
router.get('/:id/messages/:messageId/attachments/:attachmentId/download', protect, getAttachmentDownloadUrl);
  
// Activity log route (Agents/Managers/Admins only)
router.get('/:id/activity', protect, authorize(USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN), getTicketActivity);
module.exports = router;
