const express = require('express');
const router = express.Router();
const { getUsers, updateUser, getAssignableAgents } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');

const invitationUnavailable = (req, res) => res.status(501).json({
  message: 'User invitations are not available yet',
});

router.post('/invitations/accept', invitationUnavailable);
router.use(protect); // All remaining routes require authentication

router.get('/assignable-agents', authorize(USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN), getAssignableAgents);

// GET /api/users - Accessible by managers and admins
router.get('/', authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN), getUsers);

router.use(authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN));
router.get('/invitations', invitationUnavailable);
router.post('/invitations', invitationUnavailable);
router.patch('/:id', updateUser);

module.exports = router;
