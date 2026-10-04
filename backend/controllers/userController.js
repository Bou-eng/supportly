const User = require('../models/user');
const Team = require('../models/Team');
const Invitation = require('../models/Invitation');
const resolveReference = require('../utils/resolveReference');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../constants/apiConstants');

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
      query.team = await resolveReference(Team, team);
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      query.team = req.user.team?._id || req.user.team;
    }

    const users = await User.find(query)
      .populate('team', 'name')
      .select('-passwordHash')
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
    const { role, team, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role === USER_ROLES.MANAGER && user.team?.toString() !== (req.user.team?._id || req.user.team)?.toString()) {
      return res.status(403).json({ message: 'Managers can only manage users in their team' });
    }

    if (req.user.role === USER_ROLES.MANAGER && role && ![USER_ROLES.CUSTOMER, USER_ROLES.AGENT].includes(role)) {
      return res.status(403).json({ message: 'Managers cannot assign this role' });
    }

    if (role) {
      user.role = role;
    }

    if (team !== undefined) {
      user.team = await resolveReference(Team, team);
      if (team && !user.team) {
        return res.status(400).json({ message: 'Team not found' });
      }
      if (req.user.role === USER_ROLES.MANAGER && user.team?.toString() !== (req.user.team?._id || req.user.team)?.toString()) {
        return res.status(403).json({ message: 'Managers can only assign users within their team' });
      }
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid user status' });
      user.status = status;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('team', 'name')
      .select('-passwordHash');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInvitation = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const role = req.body.role || USER_ROLES.AGENT;
    const teamId = await resolveReference(Team, req.body.team);

    if (!email || !teamId) return res.status(400).json({ message: 'Email and team are required' });
    if (req.user.role === USER_ROLES.MANAGER && role !== USER_ROLES.AGENT) {
      return res.status(403).json({ message: 'Managers can only invite agents' });
    }
    if (req.user.role === USER_ROLES.MANAGER && teamId.toString() !== (req.user.team?._id || req.user.team)?.toString()) {
      return res.status(403).json({ message: 'Managers can only invite agents to their team' });
    }
    if (await User.exists({ email })) return res.status(400).json({ message: 'User already exists' });

    await Invitation.updateMany({ email, status: 'pending' }, { $set: { status: 'revoked' } });
    const rawToken = crypto.randomBytes(32).toString('hex');
    const invitation = await Invitation.create({
      email, role, team: teamId, invitedBy: req.user._id,
      tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ id: invitation._id, email, role, team: teamId, status: invitation.status, expiresAt: invitation.expiresAt, token: rawToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvitations = async (req, res) => {
  const query = { status: 'pending' };
  if (req.user.role === USER_ROLES.MANAGER) query.team = req.user.team?._id || req.user.team;
  const invitations = await Invitation.find(query).populate('team', 'name').sort({ createdAt: -1 });
  res.json(invitations);
};

const acceptInvitation = async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
    const invitation = await Invitation.findOne({ tokenHash, status: 'pending', expiresAt: { $gt: new Date() } });
    if (!invitation) return res.status(400).json({ message: 'Invitation is invalid or expired' });
    if (!req.body.name || !req.body.password) return res.status(400).json({ message: 'Name and password are required' });
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ name: req.body.name.trim(), email: invitation.email, passwordHash, role: invitation.role, team: invitation.team });
    invitation.status = 'accepted';
    await invitation.save();
    res.status(201).json({ id: user._id, email: user.email, role: user.role, status: user.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
  createInvitation,
  getInvitations,
  acceptInvitation,
};