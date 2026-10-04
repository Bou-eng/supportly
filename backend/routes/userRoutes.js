const express = require('express');
const router = express.Router();
const { getUsers, updateUser, createInvitation, getInvitations, acceptInvitation } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');

router.use(protect); // All routes require authentication

// GET /api/users - Accessible by managers and admins
router.get('/', authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN), getUsers);

router.post('/invitations/accept', acceptInvitation);
router.use(authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN));
router.get('/invitations', getInvitations);
router.post('/invitations', createInvitation);
router.patch('/:id', updateUser);

module.exports = router;