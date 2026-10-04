const KnowledgeArticle = require('../models/KnowledgeArticle');
const Category = require('../models/Category');
const resolveReference = require('../utils/resolveReference');

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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const query = req.user?.role && req.user.role !== 'customer' ? {} : { published: true };

    if (category) {
      query.category = await resolveReference(Category, category);
    }

    if (search) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { summary: { $regex: escapedSearch, $options: 'i' } },
        { content: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const total = await KnowledgeArticle.countDocuments(query);
    const articles = await KnowledgeArticle.find(query)
      .populate('category', 'name')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ articles, page, pages: Math.ceil(total / limit), total });
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

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;
    while (await KnowledgeArticle.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const categoryId = await resolveReference(Category, category);
    if (category && !categoryId) return res.status(400).json({ message: 'Category not found' });

    const article = await KnowledgeArticle.create({
      title,
      slug,
      summary,
      content,
      category: categoryId,
      author: req.user._id,
      published: published !== undefined ? published : true,
    });

    res.status(201).json(await article.populate([
      { path: 'category', select: 'name' },
      { path: 'author', select: 'name email' },
    ]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const { title, summary, content, category, published } = req.body;
    const updates = { ...(title !== undefined && { title }), ...(summary !== undefined && { summary }), ...(content !== undefined && { content }) };

    if (published !== undefined && ['manager', 'admin'].includes(req.user.role)) {
      updates.published = published;
    }

    if (category !== undefined) {
      updates.category = await resolveReference(Category, category);
      if (category && !updates.category) return res.status(400).json({ message: 'Category not found' });
    }

    if (title !== undefined) {
      const baseSlug = slugify(title);
      let slug = baseSlug;
      let suffix = 1;
      while (await KnowledgeArticle.exists({ slug, _id: { $ne: req.params.id } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
      updates.slug = slug;
    }

    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
      .populate('category', 'name')
      .populate('author', 'name email');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publishArticle = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { $set: { published: req.body.published !== false } },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('author', 'name email');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    if (!req.params.id || !require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle,
};