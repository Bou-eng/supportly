const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('defaultTeam', 'name')
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin/Manager only)
const createCategory = async (req, res) => {
  try {
    const { name, description, defaultTeam } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      defaultTeam: defaultTeam || null,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
};