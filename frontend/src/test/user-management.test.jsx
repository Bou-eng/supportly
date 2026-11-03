import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Users from '../pages/Users';
import { USER_ROLES } from '../constants/apiConstants';
import '../i18n';

const state = vi.hoisted(() => ({ role: 'manager' }));

vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ role: state.role }) }));
vi.mock('../services/userApi', () => ({
  userApi: {
    list: vi.fn(),
    teams: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    createTeam: vi.fn(),
    updateTeam: vi.fn(),
    deleteTeam: vi.fn(),
  },
}));

import { userApi } from '../services/userApi';

describe('user management policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.role = USER_ROLES.MANAGER;
    userApi.list.mockResolvedValue([]);
    userApi.teams.mockResolvedValue([{ _id: 'team-1', name: 'Support' }]);
  });

  it('shows the design-matched coming-soon message instead of an invitation form', async () => {
    const user = userEvent.setup();
    render(<Users />);
    await user.click(await screen.findByRole('button', { name: 'Invite user' }));
    expect(screen.getByText('Invitations will be added later')).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('shows team creation only to admins and creates a team', async () => {
    state.role = USER_ROLES.ADMIN;
    userApi.createTeam.mockResolvedValue({ _id: 'team-2', name: 'Billing', description: 'Billing support' });
    const user = userEvent.setup();
    render(<Users />);
    await user.click(await screen.findByRole('button', { name: /Create team/i }));
    await user.type(screen.getByLabelText(/Team name/), 'Billing');
    await user.type(screen.getByLabelText('Description'), 'Billing support');
    await user.click(screen.getByRole('button', { name: 'Create team' }));
    await waitFor(() => expect(userApi.createTeam).toHaveBeenCalledWith({ name: 'Billing', description: 'Billing support' }));
  });

  it('lets admins promote a registered customer to manager with a team', async () => {
    state.role = USER_ROLES.ADMIN;
    userApi.list.mockResolvedValue([{ _id: 'customer-1', name: 'Registered Customer', email: 'customer@example.com', role: 'customer', status: 'active', team: null }]);
    userApi.update.mockResolvedValue({ _id: 'customer-1', name: 'Registered Customer', email: 'customer@example.com', role: 'manager', status: 'active', team: { _id: 'team-1', name: 'Support' } });
    const user = userEvent.setup();
    render(<Users />);
    await user.click(await screen.findByRole('button', { name: 'Promote' }));
    await user.selectOptions(screen.getByLabelText('Role'), USER_ROLES.MANAGER);
    await user.selectOptions(screen.getByLabelText('Team'), 'team-1');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(userApi.update).toHaveBeenCalledWith('customer-1', { role: 'manager', team: 'team-1', status: 'active' }));
  });

  it('lets admins create managers and assign their team', async () => {
    state.role = USER_ROLES.ADMIN;
    userApi.create.mockResolvedValue({ _id: 'manager-2', name: 'New Manager', email: 'new-manager@example.com', role: 'manager', status: 'active', team: { _id: 'team-1', name: 'Support' } });
    const user = userEvent.setup();
    render(<Users />);
    await user.click(await screen.findByRole('button', { name: /Create user/i }));
    await user.type(screen.getByLabelText(/^Name/), 'New Manager');
    await user.type(screen.getByLabelText(/^Email/), 'new-manager@example.com');
    await user.type(screen.getByLabelText(/Initial password/), 'Created123');
    await user.selectOptions(screen.getByLabelText('Role'), USER_ROLES.MANAGER);
    await user.selectOptions(screen.getByLabelText('Team'), 'team-1');
    await user.click(screen.getByRole('button', { name: 'Create user' }));
    await waitFor(() => expect(userApi.create).toHaveBeenCalledWith({
      name: 'New Manager',
      email: 'new-manager@example.com',
      password: 'Created123',
      role: 'manager',
      team: 'team-1',
    }));
  });

  it('lets managers create only an agent assigned by the server to their team', async () => {
    userApi.create.mockResolvedValue({ _id: 'agent-2', name: 'New Agent', email: 'new-agent@example.com', role: 'agent', status: 'active', team: { _id: 'team-1', name: 'Support' } });
    const user = userEvent.setup();
    render(<Users />);
    await user.click(await screen.findByRole('button', { name: /Create user/i }));
    expect(screen.getByRole('heading', { name: 'Create agent' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Role')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Team')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Name/), 'New Agent');
    await user.type(screen.getByLabelText(/^Email/), 'new-agent@example.com');
    await user.type(screen.getByLabelText(/Initial password/), 'Created123');
    await user.click(screen.getByRole('button', { name: 'Create agent' }));
    await waitFor(() => expect(userApi.create).toHaveBeenCalledWith({
      name: 'New Agent',
      email: 'new-agent@example.com',
      password: 'Created123',
      role: 'agent',
    }));
  });

  it('lets admins edit and delete teams', async () => {
    state.role = USER_ROLES.ADMIN;
    userApi.updateTeam.mockResolvedValue({ _id: 'team-1', name: 'Customer Care', description: 'Updated support' });
    userApi.deleteTeam.mockResolvedValue({ message: 'Team deleted successfully' });
    const user = userEvent.setup();
    render(<Users />);

    await user.click(await screen.findByRole('button', { name: 'Edit Support' }));
    const nameInput = screen.getByLabelText(/^Team name/);
    await user.clear(nameInput);
    await user.type(nameInput, 'Customer Care');
    await user.type(screen.getByLabelText('Description'), 'Updated support');
    await user.click(screen.getByRole('button', { name: 'Save team' }));
    await waitFor(() => expect(userApi.updateTeam).toHaveBeenCalledWith('team-1', { name: 'Customer Care', description: 'Updated support' }));

    await user.click(await screen.findByRole('button', { name: 'Delete Customer Care' }));
    await user.click(screen.getByRole('button', { name: 'Delete team' }));
    await waitFor(() => expect(userApi.deleteTeam).toHaveBeenCalledWith('team-1'));
  });
});
