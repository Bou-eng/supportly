const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All category routes require login

router.route('/')
  .get(getCategories)
  .post(authorize('admin', 'manager'), createCategory);

module.exports = router;