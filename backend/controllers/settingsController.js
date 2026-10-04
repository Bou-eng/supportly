const User = require('../models/user');
const Workspace = require('../models/Workspace');

const getOrCreateWorkspace = async (user) => {
  if (user.workspace) return Workspace.findById(user.workspace);

  let workspace = await Workspace.findOne().sort({ createdAt: 1 });
  if (!workspace) workspace = await Workspace.create({ name: 'Supportly Corp', domain: 'supportly-help.supportly.io' });
  user.workspace = workspace._id;
  await user.save();
  return workspace;
};

const getSettings = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  const workspace = await getOrCreateWorkspace(user);
  res.json({
    profile: { name: user.name, email: user.email, language: user.preferredLanguage },
    notifications: user.notificationPreferences,
    workspace: { name: workspace.name, domain: workspace.domain },
  });
};

const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { profile, notifications, workspace } = req.body;
    if (workspace && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update workspace settings' });
    }

    if (profile) {
      if (profile.name !== undefined) {
        if (!profile.name.trim()) return res.status(400).json({ message: 'Name is required' });
        user.name = profile.name.trim();
      }
      if (profile.email !== undefined) {
        const email = profile.email.trim().toLowerCase();
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const duplicate = await User.findOne({ email, _id: { $ne: user._id } });
        if (duplicate) return res.status(400).json({ message: 'Email is already in use' });
        user.email = email;
      }
      if (profile.language !== undefined) {
        if (!['en', 'tr'].includes(profile.language)) return res.status(400).json({ message: 'Invalid language' });
        user.preferredLanguage = profile.language;
      }
    }

    if (notifications) {
      for (const key of ['ticketAssigned', 'ticketUpdated', 'weeklyReport']) {
        if (notifications[key] !== undefined && typeof notifications[key] !== 'boolean') {
          return res.status(400).json({ message: `Invalid notification preference: ${key}` });
        }
      }
      user.notificationPreferences = { ...user.notificationPreferences.toObject(), ...notifications };
    }

    const savedUser = await user.save();
    let savedWorkspace = await getOrCreateWorkspace(savedUser);
    if (workspace) {
      if (!workspace.name?.trim() || !workspace.domain?.trim()) return res.status(400).json({ message: 'Workspace name and domain are required' });
      savedWorkspace.name = workspace.name.trim();
      savedWorkspace.domain = workspace.domain.trim().toLowerCase();
      await savedWorkspace.save();
    }

    res.json({
      profile: { name: savedUser.name, email: savedUser.email, language: savedUser.preferredLanguage },
      notifications: savedUser.notificationPreferences,
      workspace: { name: savedWorkspace.name, domain: savedWorkspace.domain },
    });
  } catch (error) {
    res.status(error.code === 11000 ? 400 : 500).json({ message: error.code === 11000 ? 'Email is already in use' : error.message });
  }
};

module.exports = { getSettings, updateSettings };