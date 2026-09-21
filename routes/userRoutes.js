const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All routes require authentication

// GET /api/users - Accessible by managers and admins
router.get('/', authorize('manager', 'admin'), getUsers);

// PATCH /api/users/:id - Accessible by admins only
router.patch('/:id', authorize('admin'), updateUser);

module.exports = router;