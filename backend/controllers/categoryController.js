const Category = require('../models/Category');
const Team = require('../models/Team');
const resolveReference = require('../utils/resolveReference');

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

    const teamId = await resolveReference(Team, defaultTeam);
    if (defaultTeam && !teamId) {
      return res.status(400).json({ message: 'Default team not found' });
    }

    const category = await Category.create({
      name,
      description,
      defaultTeam: teamId,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, defaultTeam } = req.body;
    const updates = {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description }),
    };

    if (defaultTeam !== undefined) {
      updates.defaultTeam = await resolveReference(Team, defaultTeam);
      if (defaultTeam && !updates.defaultTeam) {
        return res.status(400).json({ message: 'Default team not found' });
      }
    }

    const category = await Category.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
      .populate('defaultTeam', 'name');
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(error.code === 11000 ? 400 : 500).json({ message: error.code === 11000 ? 'Category already exists' : error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};