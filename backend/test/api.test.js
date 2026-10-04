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
