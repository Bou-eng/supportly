const Team = require('../models/Team');
const User = require('../models/user');
const Ticket = require('../models/ticket');
const Category = require('../models/Category');

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
    if (typeof name !== 'string' || (description !== undefined && typeof description !== 'string')) {
      return res.status(400).json({ message: 'Team name must be text' });
    }
    const normalizedName = name.trim();

    if (!normalizedName) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const teamExists = await Team.findOne({ name: normalizedName });
    if (teamExists) {
      return res.status(400).json({ message: 'Team already exists' });
    }

    const team = await Team.create({ name: normalizedName, description: description?.trim() || '' });
    res.status(201).json(team);
  } catch (error) {
    const status = error.code === 11000 || error.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ message: error.code === 11000 ? 'Team already exists' : error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if ((name !== undefined && typeof name !== 'string') || (description !== undefined && typeof description !== 'string')) {
      return res.status(400).json({ message: 'Team name and description must be text' });
    }
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (name !== undefined) {
      const normalizedName = name.trim();
      if (!normalizedName) return res.status(400).json({ message: 'Team name is required' });
      const duplicate = await Team.exists({ _id: { $ne: team._id }, name: normalizedName });
      if (duplicate) return res.status(400).json({ message: 'Team already exists' });
      team.name = normalizedName;
    }
    if (description !== undefined) team.description = description.trim();

    await team.save();
    res.json(team);
  } catch (error) {
    const status = error.code === 11000 || error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.code === 11000 ? 'Team already exists' : error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const inUse = await Promise.all([
      User.exists({ team: req.params.id }),
      Ticket.exists({ team: req.params.id }),
      Category.exists({ defaultTeam: req.params.id }),
    ]);
    if (inUse.some(Boolean)) {
      return res.status(409).json({ message: 'Team is in use and cannot be deleted' });
    }
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
};

module.exports = {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};
