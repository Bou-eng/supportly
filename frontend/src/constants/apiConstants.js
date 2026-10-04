export const TICKET_STATUSES = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
});

export const TICKET_PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const USER_ROLES = Object.freeze({
  CUSTOMER: 'customer',
  AGENT: 'agent',
  MANAGER: 'manager',
  ADMIN: 'admin',
});

export const TICKET_STATUS_VALUES = Object.freeze(Object.values(TICKET_STATUSES));
export const TICKET_PRIORITY_VALUES = Object.freeze(Object.values(TICKET_PRIORITIES));
export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));