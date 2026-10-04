const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle,
} = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../constants/apiConstants');

router.get('/', protect, getArticles);
router.get('/:slug', getArticleBySlug);

router.post('/', protect, authorize(USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN), createArticle);
router.patch('/:id', protect, authorize(USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN), updateArticle);
router.patch('/:id/publish', protect, authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN), publishArticle);
router.delete('/:id', protect, authorize(USER_ROLES.ADMIN), deleteArticle);

module.exports = router;