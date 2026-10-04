const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You are not authorized to access this resource' });
  }

  return next();
};

const authorizeOwner = (getOwnerId) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const ownerId = getOwnerId(req);
  if (!ownerId || req.user.role !== 'customer' || ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You are not authorized to access this resource' });
  }

  return next();
};

const authorizeTeamMember = (getTeamId) => (req, res, next) => {
  const teamId = getTeamId(req);
  const userTeamId = req.user?.team?._id || req.user?.team;

  if (!req.user || !teamId || !userTeamId || teamId.toString() !== userTeamId.toString()) {
    return res.status(403).json({ message: 'You are not authorized for this team' });
  }

  return next();
};

module.exports = { authorize, authorizeOwner, authorizeTeamMember };