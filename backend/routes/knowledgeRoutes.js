const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  createArticle,
} = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

router.post('/', protect, authorize('agent', 'manager', 'admin'), createArticle);

module.exports = router;