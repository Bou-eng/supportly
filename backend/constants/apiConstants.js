const TICKET_STATUSES = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
});

const TICKET_PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

const USER_ROLES = Object.freeze({
  CUSTOMER: 'customer',
  AGENT: 'agent',
  MANAGER: 'manager',
  ADMIN: 'admin',
});

const TICKET_STATUS_VALUES = Object.freeze(Object.values(TICKET_STATUSES));
const TICKET_PRIORITY_VALUES = Object.freeze(Object.values(TICKET_PRIORITIES));
const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));

module.exports = {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  USER_ROLES,
  TICKET_STATUS_VALUES,
  TICKET_PRIORITY_VALUES,
  USER_ROLE_VALUES,
};