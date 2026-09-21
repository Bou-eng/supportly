const User = require('../models/User');

// @desc    Get all users (with optional role/team query filters)
// @route   GET /api/users
// @access  Private (Manager, Admin)
const getUsers = async (req, res) => {
  try {
    const { role, team } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (team) {
      query.team = team;
    }

    const users = await User.find(query)
      .populate('team', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role or assign team
// @route   PATCH /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { role, team } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) {
      user.role = role;
    }

    if (team !== undefined) {
      user.team = team || null;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('team', 'name')
      .select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
};