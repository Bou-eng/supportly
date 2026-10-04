import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Tickets from '../pages/Tickets';
import CreateTicket from '../pages/CreateTicket';
import TicketDetail from '../pages/TicketDetail';
import { ticketApi } from '../services/ticketApi';
import { categoryApi } from '../services/categoryApi';

vi.mock('../services/ticketApi', () => ({
  ticketApi: {
    list: vi.fn(),
    create: vi.fn(),
    get: vi.fn(),
    messages: vi.fn(),
    activity: vi.fn(),
    reply: vi.fn(),
    updateStatus: vi.fn(),
    updatePriority: vi.fn(),
    update: vi.fn(),
    assign: vi.fn(),
    attachmentUrl: vi.fn(),
  },
}));

vi.mock('../services/categoryApi', () => ({ categoryApi: { list: vi.fn() } }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ role: 'customer' }) }));

describe('ticket workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryApi.list.mockResolvedValue([{ _id: 'cat-1', name: 'Billing & Subscription' }]);
    ticketApi.list.mockResolvedValue({ tickets: [], page: 1, pages: 1, total: 0 });
  });

  it('creates a ticket with the selected category', async () => {
    const user = userEvent.setup();
    ticketApi.create.mockResolvedValue({ _id: 'ticket-1', ticketNumber: 'SUP-1' });
    render(<MemoryRouter><CreateTicket /></MemoryRouter>);
    await user.type(await screen.findByLabelText(/Subject/i), 'Cannot pay invoice');
    await user.selectOptions(screen.getByRole('combobox'), 'cat-1');
    await user.type(screen.getByPlaceholderText(/descriptionPlaceholder/i), 'Payment fails');
    await user.type(screen.getByPlaceholderText(/contactEmailPlaceholder/i), 'customer@example.com');
    await user.click(screen.getByRole('button', { name: /Submit/i }));
    await waitFor(() => expect(ticketApi.create).toHaveBeenCalledTimes(1));
    expect(ticketApi.create).toHaveBeenCalledWith(expect.objectContaining({ category: 'cat-1', title: 'Cannot pay invoice' }));
  });

  it('loads and filters tickets through the API', async () => {
    const user = userEvent.setup();
    ticketApi.list.mockResolvedValue({ tickets: [{ _id: 't1', ticketNumber: 'SUP-1', title: 'Invoice issue', user: { name: 'Customer' }, priority: 'high', status: 'open', updatedAt: new Date().toISOString() }], page: 1, pages: 1, total: 1 });
    render(<MemoryRouter><Tickets /></MemoryRouter>);
    expect(await screen.findByText('Invoice issue')).toBeInTheDocument();
    await user.selectOptions(screen.getAllByRole('combobox')[0], 'open');
    await waitFor(() => expect(ticketApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'open' })));
  });

  it('submits a reply once even when the send button is clicked twice', async () => {
    const user = userEvent.setup();
    ticketApi.get.mockResolvedValue({ _id: 't1', ticketNumber: 'SUP-1', title: 'Issue', description: 'Details', status: 'open', priority: 'low', user: { name: 'Customer', email: 'customer@example.com' } });
    ticketApi.messages.mockResolvedValue([]);
    ticketApi.reply.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ _id: 'm1', content: 'Reply', type: 'public', author: { name: 'Customer', role: 'customer' }, createdAt: new Date().toISOString() }), 20)));
    const view = render(<MemoryRouter><TicketDetail /></MemoryRouter>);
    await waitFor(() => expect(view.container.querySelector('textarea')).not.toBeNull());
    const textbox = view.container.querySelector('textarea');
    await user.type(textbox, 'Reply text');
    const button = screen.getByRole('button', { name: /ticketDetail.sendReply/i });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(ticketApi.reply).toHaveBeenCalledTimes(1));
  });
});
