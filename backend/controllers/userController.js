const User = require('../models/user');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');
const resolveReference = require('../utils/resolveReference');
const { USER_ROLES } = require('../constants/apiConstants');

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const operationalUserResponse = async (userId) => User.findById(userId)
  .populate('team', 'name')
  .select('-passwordHash');

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
      const managerTeam = req.user.team?._id || req.user.team;
      if (!managerTeam) return res.status(403).json({ message: 'Manager must belong to a team' });
      delete query.team;
      query.$or = [
        { role: USER_ROLES.CUSTOMER },
        { role: USER_ROLES.AGENT, team: managerTeam },
      ];
      if (role) query.$and = [{ role }];
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

// @desc    Create an agent or manager account
// @route   POST /api/users
// @access  Private (Manager, Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let { role, team } = req.body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (!PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' });
    }
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      const managerTeam = req.user.team?._id || req.user.team;
      if (!managerTeam) {
        return res.status(403).json({ message: 'Manager must belong to a team' });
      }
      if (role !== undefined && role !== USER_ROLES.AGENT) {
        return res.status(403).json({ message: 'Managers can only create agent accounts' });
      }
      if (team !== undefined && team && team.toString() !== managerTeam.toString()) {
        return res.status(403).json({ message: 'Managers can only create agents in their own team' });
      }
      role = USER_ROLES.AGENT;
      team = managerTeam;
    } else {
      if (![USER_ROLES.AGENT, USER_ROLES.MANAGER].includes(role)) {
        return res.status(400).json({ message: 'Admins can only create agent or manager accounts' });
      }
      const resolvedTeam = await resolveReference(Team, team);
      if (!resolvedTeam || !(await Team.exists({ _id: resolvedTeam }))) {
        return res.status(400).json({ message: 'A valid team is required' });
      }
      team = resolvedTeam;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role,
      team,
      status: 'active',
    });

    res.status(201).json(await operationalUserResponse(user._id));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
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

    if (user._id.toString() === req.user._id.toString() && (role || status === 'inactive')) {
      return res.status(400).json({ message: 'You cannot change your own role or deactivate your own account' });
    }
    if (user.role === USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Administrator accounts cannot be changed from user management' });
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      const managerTeam = req.user.team?._id || req.user.team;
      const isCustomer = user.role === USER_ROLES.CUSTOMER;
      const isOwnAgent = user.role === USER_ROLES.AGENT && user.team?.toString() === managerTeam?.toString();
      if (!managerTeam || (!isCustomer && !isOwnAgent)) {
        return res.status(403).json({ message: 'Managers can only promote customers or manage agents in their team' });
      }
      if (role !== undefined && role !== USER_ROLES.AGENT) {
        return res.status(403).json({ message: 'Managers can only assign the agent role' });
      }
      if (team !== undefined && team && team.toString() !== managerTeam.toString()) {
        return res.status(403).json({ message: 'Managers can only assign agents to their own team' });
      }
      if (isCustomer && role !== USER_ROLES.AGENT) {
        return res.status(400).json({ message: 'Select the agent role to promote this customer' });
      }
      user.role = USER_ROLES.AGENT;
      user.team = managerTeam;
    } else {
      if (role !== undefined) {
        if (![USER_ROLES.CUSTOMER, USER_ROLES.AGENT, USER_ROLES.MANAGER].includes(role)) {
          return res.status(400).json({ message: 'Invalid user role' });
        }
        user.role = role;
      }

      if (team !== undefined) {
        user.team = await resolveReference(Team, team);
        if (team && !user.team) return res.status(400).json({ message: 'Team not found' });
      }

      if ([USER_ROLES.AGENT, USER_ROLES.MANAGER].includes(user.role) && !user.team) {
        return res.status(400).json({ message: 'Agents and managers must belong to a team' });
      }
      if (user.role === USER_ROLES.CUSTOMER) user.team = null;
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid user status' });
      user.status = status;
    }

    await user.save();

    const updatedUser = await operationalUserResponse(user._id);

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssignableAgents = async (req, res) => {
  const query = { role: USER_ROLES.AGENT, status: 'active' };
  if (req.user.role !== USER_ROLES.ADMIN) {
    const teamId = req.user.team?._id || req.user.team;
    if (!teamId) return res.json([]);
    query.team = teamId;
  }
  const agents = await User.find(query).select('name email role team status').populate('team', 'name').sort({ name: 1 });
  res.json(agents);
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  getAssignableAgents,
};
