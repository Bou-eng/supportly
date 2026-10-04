const Team = require('../models/Team');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Admin/Manager only)
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(400).json({ message: 'Team already exists' });
    }

    const team = await Team.create({ name, description });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name !== undefined && { name: name.trim() }), ...(description !== undefined && { description }) } },
      { new: true, runValidators: true }
    );

    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(error.code === 11000 ? 400 : 500).json({ message: error.code === 11000 ? 'Team already exists' : error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};