const { USER_ROLES } = require('../constants/apiConstants');

const referenceId = (value) => value?._id || value || null;

const sameReference = (left, right) => {
  const leftId = referenceId(left);
  const rightId = referenceId(right);
  return Boolean(leftId && rightId && leftId.toString() === rightId.toString());
};

const isSupportRole = (role) => [USER_ROLES.AGENT, USER_ROLES.MANAGER].includes(role);

const canAccessTicket = (ticket, user) => {
  if (!ticket || !user) return false;
  if (user.role === USER_ROLES.ADMIN) return true;
  if (sameReference(ticket.user, user._id)) return true;
  if (!isSupportRole(user.role)) return false;

  const ticketTeam = referenceId(ticket.team);
  if (!ticketTeam) return true; // Shared intake queue until a support team claims it.
  return sameReference(ticketTeam, user.team);
};

const ticketScopeForUser = (user) => {
  if (user.role === USER_ROLES.ADMIN) return {};
  if (user.role === USER_ROLES.CUSTOMER) return { user: user._id };

  const teamId = referenceId(user.team);
  const visible = [{ assignedTo: user._id }, { team: null }];
  if (teamId) visible.unshift({ team: teamId });
  return { $or: visible };
};

module.exports = {
  canAccessTicket,
  isSupportRole,
  referenceId,
  sameReference,
  ticketScopeForUser,
};
