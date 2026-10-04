const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');

router.use(protect); // All category routes require login

router.route('/')
  .get(getCategories)
  .post(authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), createCategory);
router.route('/:id')
  .patch(authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), updateCategory)
  .delete(authorize(USER_ROLES.ADMIN), deleteCategory);

module.exports = router;