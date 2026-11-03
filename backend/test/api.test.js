process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.FRONTEND_URL = 'http://localhost:3000';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

let mongo;
let app;
let User;
let Team;
let Category;
let Ticket;
let Message;
let KnowledgeArticle;
let Notification;
let agent;
let customer;
let secondCustomer;
let manager;
let admin;
let team;
let category;
let customerClient;
let secondCustomerClient;
let agentClient;
let managerClient;
let adminClient;

const registerAndLogin = async (name, email, password = 'Supportly123') => {
  const client = request.agent(app);
  const response = await client.post('/api/auth/register').send({ name, email, password });
  assert.equal(response.status, 201);
  await client.post('/api/auth/login').send({ email, password });
  return client;
};

const createUser = async (data) => User.create({
  name: data.name,
  email: data.email,
  passwordHash: await bcrypt.hash('Supportly123', 10),
  role: data.role,
  team: data.team || null,
  status: data.status || 'active',
});

const createTicket = async (client, values = {}) => {
  const response = await client.post('/api/tickets').send({
    title: values.title || 'Test ticket',
    description: values.description || 'Test ticket description',
    category: values.category || category._id.toString(),
    priority: values.priority || 'medium',
    ...values,
  });
  assert.equal(response.status, 201);
  return response.body;
};

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  ({ app } = require('../server'));
  User = require('../models/user');
  Team = require('../models/Team');
  Category = require('../models/Category');
  Ticket = require('../models/ticket');
  Message = require('../models/Message');
  KnowledgeArticle = require('../models/KnowledgeArticle');
  Notification = require('../models/Notification');
  await mongoose.connect(process.env.MONGO_URI);

  team = await Team.create({ name: 'Technical Support', description: 'Test team' });
  category = await Category.create({ name: 'Technical Test', defaultTeam: team._id });
  customer = await createUser({ name: 'Customer One', email: 'customer-one@example.com', role: 'customer' });
  secondCustomer = await createUser({ name: 'Customer Two', email: 'customer-two@example.com', role: 'customer' });
  agent = await createUser({ name: 'Agent One', email: 'agent@example.com', role: 'agent', team: team._id });
  manager = await createUser({ name: 'Manager One', email: 'manager@example.com', role: 'manager', team: team._id });
  admin = await createUser({ name: 'Admin One', email: 'admin@example.com', role: 'admin' });

  customerClient = await registerAndLogin('Registered Customer', 'registered@example.com');
  secondCustomerClient = request.agent(app);
  await secondCustomerClient.post('/api/auth/login').send({ email: 'customer-two@example.com', password: 'Supportly123' });
  agentClient = request.agent(app);
  await agentClient.post('/api/auth/login').send({ email: agent.email, password: 'Supportly123' });
  managerClient = request.agent(app);
  await managerClient.post('/api/auth/login').send({ email: manager.email, password: 'Supportly123' });
  adminClient = request.agent(app);
  await adminClient.post('/api/auth/login').send({ email: admin.email, password: 'Supportly123' });
});

test.after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('registration cannot create admin accounts', async () => {
  const response = await request(app).post('/api/auth/register').send({
    name: 'Public Admin Attempt',
    email: 'public-admin@example.com',
    password: 'Supportly123',
    role: 'admin',
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.user.role, 'customer');
  const user = await User.findOne({ email: 'public-admin@example.com' });
  assert.equal(user.role, 'customer');
});

test('login succeeds and invalid credentials fail', async () => {
  const success = await request(app).post('/api/auth/login').send({ email: 'agent@example.com', password: 'Supportly123' });
  assert.equal(success.status, 200);
  assert.match(success.headers['set-cookie'][0], /HttpOnly/i);
  const failure = await request(app).post('/api/auth/login').send({ email: 'agent@example.com', password: 'wrong-password' });
  assert.equal(failure.status, 401);
});

test('customers can only access their own tickets', async () => {
  const ticket = await createTicket(customerClient, { contactEmail: 'alternate@example.com' });
  assert.equal(ticket.contactEmail, 'alternate@example.com');
  const forbidden = await secondCustomerClient.get(`/api/tickets/${ticket._id}`);
  assert.equal(forbidden.status, 403);
  const owner = await customerClient.get(`/api/tickets/${ticket.ticketNumber}`);
  assert.equal(owner.status, 200);
});

test('all authenticated roles can create tickets', async () => {
  for (const client of [customerClient, agentClient, managerClient, adminClient]) {
    const response = await client.post('/api/tickets').send({
      title: 'Role ticket creation test',
      description: 'Each authenticated role can create a ticket.',
      category: category._id.toString(),
      priority: 'low',
    });
    assert.equal(response.status, 201);
  }
});

test('agents can access tickets in their team but not another team', async () => {
  const ticket = await createTicket(customerClient);
  const allowed = await agentClient.get(`/api/tickets/${ticket._id}`);
  assert.equal(allowed.status, 200);
  const otherTeam = await Team.create({ name: 'Billing Test', description: '' });
  const otherCategory = await Category.create({ name: 'Billing Test', defaultTeam: otherTeam._id });
  const otherTicket = await createTicket(customerClient, { category: otherCategory._id.toString() });
  const forbidden = await agentClient.get(`/api/tickets/${otherTicket._id}`);
  assert.equal(forbidden.status, 403);
});

test('internal notes are hidden from customers', async () => {
  const ticket = await createTicket(customerClient);
  const note = await agentClient.post(`/api/tickets/${ticket._id}/messages`).send({ content: 'Internal note', type: 'internal' });
  assert.equal(note.status, 201);
  const staffMessages = await agentClient.get(`/api/tickets/${ticket._id}/messages`);
  const customerMessages = await customerClient.get(`/api/tickets/${ticket._id}/messages`);
  assert.equal(staffMessages.body.some((message) => message.type === 'internal'), true);
  assert.equal(customerMessages.body.some((message) => message.type === 'internal'), false);
});

test('customers cannot change ticket status', async () => {
  const ticket = await createTicket(customerClient);
  const response = await customerClient.patch(`/api/tickets/${ticket._id}/status`).send({ status: 'resolved' });
  assert.equal(response.status, 403);
});

test('assignment requires an eligible active agent and team permission', async () => {
  const ticket = await createTicket(customerClient);
  const assigned = await managerClient.patch(`/api/tickets/${ticket._id}/assign`).send({ assignedTo: agent._id.toString() });
  assert.equal(assigned.status, 200);
  const invalid = await managerClient.patch(`/api/tickets/${ticket._id}/assign`).send({ assignedTo: customer._id.toString() });
  assert.equal(invalid.status, 400);
  const customerAttempt = await customerClient.patch(`/api/tickets/${ticket._id}/assign`).send({ assignedTo: agent._id.toString() });
  assert.equal(customerAttempt.status, 403);
});

test('reports calculate summary and breakdowns', async () => {
  await createTicket(customerClient, { priority: 'high' });
  const response = await adminClient.get('/api/reports/summary?from=2020-01-01&to=2030-01-01');
  assert.equal(response.status, 200);
  assert.equal(typeof response.body.overview.openTickets, 'number');
  assert.equal(typeof response.body.overview.unassignedTickets, 'number');
  assert.equal(typeof response.body.byStatus.open, 'number');
  assert.equal(typeof response.body.byPriority.high, 'number');
  const volume = await adminClient.get('/api/reports/ticket-volume?from=2020-01-01&to=2030-01-01');
  assert.equal(volume.status, 200);
  assert.equal(Array.isArray(volume.body.volume), true);
});

test('user list excludes password hashes', async () => {
  const response = await adminClient.get('/api/users');
  assert.equal(response.status, 200);
  assert.equal(response.body.length > 0, true);
  assert.equal(response.body.some((user) => Object.hasOwn(user, 'passwordHash')), false);
});

test('ticket access and assignment stay inside team boundaries', async () => {
  const otherTeam = await Team.create({ name: 'Boundary Team' });
  const otherAgent = await createUser({ name: 'Boundary Agent', email: 'boundary-agent@example.com', role: 'agent', team: otherTeam._id });
  const otherTicket = await Ticket.create({ user: customer._id, title: 'Boundary ticket', description: 'Private to another team', team: otherTeam._id, assignedTo: otherAgent._id });

  assert.equal((await managerClient.get(`/api/tickets/${otherTicket._id}`)).status, 403);
  assert.equal((await agentClient.patch(`/api/tickets/${otherTicket._id}/assign`).send({ assignedTo: null })).status, 403);
});

test('generic ticket updates cannot bypass workflow validation', async () => {
  const ticket = await createTicket(customerClient);
  const response = await agentClient.patch(`/api/tickets/${ticket._id}`).send({
    assignedTo: customer._id.toString(),
    status: 'closed',
  });
  assert.equal(response.status, 400);
  const unchanged = await Ticket.findById(ticket._id);
  assert.equal(unchanged.assignedTo, null);
  assert.equal(unchanged.status, 'open');
});

test('invitations are explicitly unavailable until implemented', async () => {
  const accept = await request(app).post('/api/users/invitations/accept').send({ token: 'unused' });
  const create = await managerClient.post('/api/users/invitations').send({ email: 'later@example.com', team: team._id });
  assert.equal(accept.status, 501);
  assert.equal(create.status, 501);
});

test('agents create drafts and unpublished articles are not public', async () => {
  const created = await agentClient.post('/api/articles').send({
    title: 'Agent Draft Security Test',
    content: 'Draft content',
    published: true,
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.published, false);
  const publicRead = await request(app).get(`/api/articles/${created.body.slug}`);
  assert.equal(publicRead.status, 404);
  assert.equal(await KnowledgeArticle.countDocuments({ slug: created.body.slug, published: false }), 1);
});

test('internal notes do not notify customers', async () => {
  const ticket = await createTicket(customerClient);
  const ownerId = ticket.user._id;
  const before = await Notification.countDocuments({ recipient: ownerId, relatedTicket: ticket._id, type: 'NEW_MESSAGE' });
  const response = await agentClient.post(`/api/tickets/${ticket._id}/messages`).send({ content: 'Private note', type: 'internal' });
  const after = await Notification.countDocuments({ recipient: ownerId, relatedTicket: ticket._id, type: 'NEW_MESSAGE' });
  assert.equal(response.status, 201);
  assert.equal(after, before);
});

test('agent report summary uses the same ticket scope as the ticket list', async () => {
  const list = await agentClient.get('/api/tickets?limit=100');
  const summary = await agentClient.get('/api/reports/summary?from=2020-01-01&to=2035-01-01');
  assert.equal(list.status, 200);
  assert.equal(summary.status, 200);
  assert.equal(summary.body.overview.totalTickets, list.body.total);
});

test('the production test-notification route is removed', async () => {
  const response = await customerClient.post('/api/notifications/test').send({ ticketId: new mongoose.Types.ObjectId() });
  assert.equal(response.status, 404);
});

test('managers promote only agents into their own team', async () => {
  const promotable = await createUser({ name: 'Promotable Customer', email: 'promotable@example.com', role: 'customer' });
  const promoted = await managerClient.patch(`/api/users/${promotable._id}`).send({ role: 'agent', status: 'active' });
  assert.equal(promoted.status, 200);
  assert.equal(promoted.body.role, 'agent');
  assert.equal(promoted.body.team._id, team._id.toString());

  const secondPromotable = await createUser({ name: 'No Manager Promotion', email: 'no-manager-promotion@example.com', role: 'customer' });
  const forbidden = await managerClient.patch(`/api/users/${secondPromotable._id}`).send({ role: 'manager' });
  assert.equal(forbidden.status, 403);
});

test('admins promote registered customers to manager or agent roles', async () => {
  const promotionTeam = await Team.create({ name: 'Admin Promotion Team' });
  const futureManager = await createUser({ name: 'Future Manager', email: 'future-manager@example.com', role: 'customer' });
  const promotedManager = await adminClient.patch(`/api/users/${futureManager._id}`).send({ role: 'manager', team: promotionTeam._id.toString(), status: 'active' });
  assert.equal(promotedManager.status, 200);
  assert.equal(promotedManager.body.role, 'manager');
  assert.equal(promotedManager.body.team._id, promotionTeam._id.toString());

  const futureAgent = await createUser({ name: 'Future Agent', email: 'future-agent@example.com', role: 'customer' });
  const promotedAgent = await adminClient.patch(`/api/users/${futureAgent._id}`).send({ role: 'agent', team: promotionTeam._id.toString(), status: 'active' });
  assert.equal(promotedAgent.status, 200);
  assert.equal(promotedAgent.body.role, 'agent');
});

test('admins create agent and manager accounts with assigned teams', async () => {
  const creationTeam = await Team.create({ name: 'Admin Creation Team' });
  const createdAgent = await adminClient.post('/api/users').send({
    name: 'Created Agent',
    email: 'created-agent@example.com',
    password: 'Created123',
    role: 'agent',
    team: creationTeam._id.toString(),
  });
  assert.equal(createdAgent.status, 201);
  assert.equal(createdAgent.body.role, 'agent');
  assert.equal(createdAgent.body.team._id, creationTeam._id.toString());
  assert.equal(Object.hasOwn(createdAgent.body, 'passwordHash'), false);

  const createdManager = await adminClient.post('/api/users').send({
    name: 'Created Manager',
    email: 'created-manager@example.com',
    password: 'Created123',
    role: 'manager',
    team: creationTeam._id.toString(),
  });
  assert.equal(createdManager.status, 201);
  assert.equal(createdManager.body.role, 'manager');
  assert.equal(createdManager.body.team._id, creationTeam._id.toString());

  const login = await request(app).post('/api/auth/login').send({
    email: 'created-manager@example.com',
    password: 'Created123',
  });
  assert.equal(login.status, 200);
});

test('managers create agents only in their own team', async () => {
  const created = await managerClient.post('/api/users').send({
    name: 'Manager Created Agent',
    email: 'manager-created-agent@example.com',
    password: 'Created123',
    role: 'agent',
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.role, 'agent');
  assert.equal(created.body.team._id, team._id.toString());

  const managerAttempt = await managerClient.post('/api/users').send({
    name: 'Forbidden Manager',
    email: 'forbidden-created-manager@example.com',
    password: 'Created123',
    role: 'manager',
  });
  assert.equal(managerAttempt.status, 403);

  const otherTeam = await Team.create({ name: 'Manager Cross Team Creation' });
  const crossTeamAttempt = await managerClient.post('/api/users').send({
    name: 'Cross Team Agent',
    email: 'cross-team-created-agent@example.com',
    password: 'Created123',
    role: 'agent',
    team: otherTeam._id.toString(),
  });
  assert.equal(crossTeamAttempt.status, 403);
  assert.equal((await agentClient.post('/api/users').send({
    name: 'Agent Created User',
    email: 'agent-created-user@example.com',
    password: 'Created123',
    role: 'agent',
  })).status, 403);
});

test('user creation validates role, team, email, password, and duplicates', async () => {
  assert.equal((await adminClient.post('/api/users').send({
    name: 'Invalid Customer', email: 'new-customer@example.com', password: 'Created123', role: 'customer', team: team._id,
  })).status, 400);
  assert.equal((await adminClient.post('/api/users').send({
    name: 'Missing Team', email: 'missing-team@example.com', password: 'Created123', role: 'agent',
  })).status, 400);
  assert.equal((await adminClient.post('/api/users').send({
    name: 'Bad Email', email: 'not-an-email', password: 'Created123', role: 'agent', team: team._id,
  })).status, 400);
  assert.equal((await adminClient.post('/api/users').send({
    name: 'Weak Password', email: 'weak-password@example.com', password: 'weak', role: 'agent', team: team._id,
  })).status, 400);
  assert.equal((await adminClient.post('/api/users').send({
    name: 'Duplicate Email', email: admin.email.toUpperCase(), password: 'Created123', role: 'manager', team: team._id,
  })).status, 400);
});

test('only admins can create teams', async () => {
  const managerAttempt = await managerClient.post('/api/teams').send({ name: 'Manager Team Attempt' });
  const adminAttempt = await adminClient.post('/api/teams').send({ name: 'Admin Created Team', description: 'Created through the API' });
  assert.equal(managerAttempt.status, 403);
  assert.equal(adminAttempt.status, 201);
});

test('admins edit and delete unused teams while managers cannot', async () => {
  const editableTeam = await Team.create({ name: 'Editable Team', description: 'Before' });
  assert.equal((await managerClient.patch(`/api/teams/${editableTeam._id}`).send({ name: 'Manager Edit' })).status, 403);
  assert.equal((await managerClient.delete(`/api/teams/${editableTeam._id}`)).status, 403);

  const updated = await adminClient.patch(`/api/teams/${editableTeam._id}`).send({
    name: 'Edited Team',
    description: 'After',
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, 'Edited Team');
  assert.equal(updated.body.description, 'After');

  const deleted = await adminClient.delete(`/api/teams/${editableTeam._id}`);
  assert.equal(deleted.status, 200);
  assert.equal(await Team.exists({ _id: editableTeam._id }), null);
});

test('team deletion is blocked while the team is referenced', async () => {
  const response = await adminClient.delete(`/api/teams/${team._id}`);
  assert.equal(response.status, 409);
});

test('teamless intake tickets are visible and inherit the assignee team', async () => {
  const intakeCategory = await Category.create({ name: 'Unrouted Intake' });
  const created = await createTicket(customerClient, { category: intakeCategory._id.toString(), title: 'Unrouted intake ticket' });
  assert.equal(created.team, null);
  const visible = await agentClient.get(`/api/tickets/${created._id}`);
  assert.equal(visible.status, 200);
  const assigned = await agentClient.patch(`/api/tickets/${created._id}/assign`).send({ assignedTo: agent._id.toString() });
  assert.equal(assigned.status, 200);
  assert.equal(assigned.body.team._id, team._id.toString());
});

test('notification preferences suppress ticket updates', async () => {
  const ticket = await createTicket(customerClient);
  const owner = await User.findById(ticket.user._id);
  owner.notificationPreferences.ticketUpdated = false;
  await owner.save();
  const before = await Notification.countDocuments({ recipient: owner._id, relatedTicket: ticket._id, type: 'STATUS_CHANGE' });
  const response = await managerClient.patch(`/api/tickets/${ticket._id}/status`).send({ status: 'in-progress' });
  const after = await Notification.countDocuments({ recipient: owner._id, relatedTicket: ticket._id, type: 'STATUS_CHANGE' });
  assert.equal(response.status, 200);
  assert.equal(after, before);
  owner.notificationPreferences.ticketUpdated = true;
  await owner.save();
});

test('message model supports attachment-only replies', async () => {
  const ticket = await Ticket.create({ user: customer._id, title: 'Attachment only', description: 'Test', team: team._id });
  const message = await Message.create({
    ticket: ticket._id,
    author: customer._id,
    content: '',
    attachments: [{ name: 'note.txt', publicId: 'audit/note', resourceType: 'raw', mimeType: 'text/plain', bytes: 4 }],
  });
  assert.equal(message.content, '');
  assert.equal(message.attachments.length, 1);
});

test('customers cannot download attachments from internal notes', async () => {
  const ticket = await createTicket(customerClient);
  const message = await Message.create({
    ticket: ticket._id,
    author: agent._id,
    type: 'internal',
    content: 'Private attachment',
    attachments: [{ name: 'private.txt', publicId: 'audit/private', resourceType: 'raw', mimeType: 'text/plain', bytes: 7 }],
  });
  const attachment = message.attachments[0];
  const response = await customerClient.get(`/api/tickets/${ticket._id}/messages/${message._id}/attachments/${attachment._id}/download`);
  assert.equal(response.status, 404);
});
