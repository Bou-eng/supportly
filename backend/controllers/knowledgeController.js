const KnowledgeArticle = require('../models/KnowledgeArticle');

// Helper to generate a URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get published articles (with search support)
// @route   GET /api/articles
// @access  Public / Private
const getArticles = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { published: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search,$options: 'i' } },
        { summary: { $regex: search,$options: 'i' } },
        { content: { $regex: search,$options: 'i' } },
      ];
    }

    const articles = await KnowledgeArticle.find(query)
      .populate('category', 'name')
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public / Private
const getArticleBySlug = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findOne({ slug: req.params.slug })
      .populate('category', 'name')
      .populate('author', 'name email');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an article
// @route   POST /api/articles
// @access  Private (Agent, Manager, Admin)
const createArticle = async (req, res) => {
  try {
    const { title, summary, content, category, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let slug = slugify(title);
    const existing = await KnowledgeArticle.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await KnowledgeArticle.create({
      title,
      slug,
      summary,
      content,
      category: category || null,
      author: req.user._id,
      published: published !== undefined ? published : true,
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
};