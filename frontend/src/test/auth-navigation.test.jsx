import React from 'react';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRoute from '../components/auth/RoleRoute';
import Sidebar from '../components/layout/Sidebar';
import Login from '../pages/Login';
import { USER_ROLES } from '../constants/apiConstants';
import { authApi } from '../services/authApi';
import '../i18n';

vi.mock('../services/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('authentication and navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authApi.getCurrentUser.mockRejectedValue(new Error('no session'));
  });

  it('restores a session from /auth/me', async () => {
    authApi.getCurrentUser.mockResolvedValue({ user: { id: 'u1', name: 'Restored User', role: 'customer' } });
    render(<AuthProvider><div>session-ready</div></AuthProvider>);
    await waitFor(() => expect(screen.getByText('session-ready')).toBeInTheDocument());
    await waitFor(() => expect(JSON.parse(localStorage.getItem('user')).name).toBe('Restored User'));
  });

  it('submits login credentials through the auth context', async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({ user: { id: 'u1', name: 'Signed In', role: 'customer' } });
    render(<ThemeProvider><AuthProvider><MemoryRouter><Login /></MemoryRouter></AuthProvider></ThemeProvider>);
    await user.type(screen.getByPlaceholderText('you@company.com'), 'user@example.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'Supportly123');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'Supportly123' }));
  });

  it('redirects unauthenticated users away from protected routes', () => {
    render(<AuthContext.Provider value={{ loading: false, isAuthenticated: false }}><MemoryRouter initialEntries={['/private']}><Routes>
      <Route element={<ProtectedRoute />}><Route path="/private" element={<div>private content</div>} /></Route>
      <Route path="/login" element={<div>login page</div>} />
    </Routes></MemoryRouter></AuthContext.Provider>);
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects customers away from staff role routes', () => {
    render(<AuthContext.Provider value={{ role: USER_ROLES.CUSTOMER, loading: false }}><MemoryRouter initialEntries={['/staff']}><Routes>
      <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMIN]} />}><Route path="/staff" element={<div>staff content</div>} /></Route>
      <Route path="/overview" element={<div>overview page</div>} />
    </Routes></MemoryRouter></AuthContext.Provider>);
    expect(screen.getByText('overview page')).toBeInTheDocument();
  });

  it('hides staff navigation links from customers', () => {
    render(<AuthContext.Provider value={{ role: USER_ROLES.CUSTOMER }}><MemoryRouter><Sidebar /></MemoryRouter></AuthContext.Provider>);
    expect(screen.queryByRole('link', { name: /Team Queue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Users/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Reports/i })).not.toBeInTheDocument();
  });
});
