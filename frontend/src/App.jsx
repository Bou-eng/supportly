import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/layout/MainLayout';
import Overview from './pages/Overview';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import TeamQueue from './pages/TeamQueue';
import KnowledgeBase from './pages/KnowledgeBase';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import { USER_ROLES } from './constants/apiConstants';

const PagePlaceholder = ({ title }) => (
  <div style={{ padding: '1rem' }}>
    <h2>{title}</h2>
    <p>This view will be built in the next step.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN]} />}>
          <Route path="/team-queue" element={<TeamQueue />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]} />}>
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;