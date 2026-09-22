import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import './Tickets.css';

// Mock list of tickets matching backend schema
const MOCK_TICKETS = [
  { id: 'T-1089', subject: 'Unable to connect custom domain', customer: 'Sarah Jenkins', assignee: 'Alex R.', priority: 'high', status: 'open', updated: '10 mins ago' },
  { id: 'T-1088', subject: 'Billing query regarding annual invoice', customer: 'Alex Rivera', assignee: 'Me', priority: 'medium', status: 'in-progress', updated: '25 mins ago' },
  { id: 'T-1087', subject: 'SSO Login failing for team members', customer: 'TechCorp Inc.', assignee: 'Unassigned', priority: 'high', status: 'open', updated: '1 hour ago' },
  { id: 'T-1086', subject: 'Feature request: Dark mode export', customer: 'David Chen', assignee: 'Me', priority: 'low', status: 'resolved', updated: '3 hours ago' },
  { id: 'T-1085', subject: 'API Rate limit exceeded on webhooks', customer: 'StartupX', assignee: 'Emily W.', priority: 'medium', status: 'closed', updated: '5 hours ago' },
  { id: 'T-1084', subject: 'OAuth token refresh failing in Node SDK', customer: 'DevOps Team', assignee: 'Me', priority: 'high', status: 'in-progress', updated: '1 day ago' },
];

const Tickets = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter logic
  const filteredTickets = MOCK_TICKETS.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="tickets-page">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('tickets.title')}</h1>
          <p className="page-subtitle">{t('tickets.subtitle')}</p>
        </div>
        <Link to="/tickets/new">
          <Button variant="primary">➕ {t('nav.createTicket')}</Button>
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <Card className="filter-card">
        <div className="filters-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('tickets.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dropdown-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('tickets.filterStatus')}</option>
              <option value="open">{t('status.open')}</option>
              <option value="in-progress">{t('status.inProgress')}</option>
              <option value="resolved">{t('status.resolved')}</option>
              <option value="closed">{t('status.closed')}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('tickets.filterPriority')}</option>
              <option value="high">{t('priority.high')}</option>
              <option value="medium">{t('priority.medium')}</option>
              <option value="low">{t('priority.low')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets List Table */}
      <Card>
        <div className="table-responsive">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>{t('tickets.table.id')}</th>
                <th>{t('tickets.table.subject')}</th>
                <th>{t('tickets.table.customer')}</th>
                <th>{t('tickets.table.assignee')}</th>
                <th>{t('tickets.table.priority')}</th>
                <th>{t('tickets.table.status')}</th>
                <th>{t('tickets.table.updated')}</th>
                <th>{t('tickets.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="ticket-id-cell">{ticket.id}</td>
                    <td className="ticket-subject-cell">
                      <Link to={`/tickets/${ticket.id}`} className="subject-link">
                        {ticket.subject}
                      </Link>
                    </td>
                    <td>{ticket.customer}</td>
                    <td>
                      <span className="assignee-badge">{ticket.assignee}</span>
                    </td>
                    <td>
                      <Badge variant={`priority-${ticket.priority}`}>
                        {t(`priority.${ticket.priority}`)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={`status-${ticket.status}`}>
                        {t(`status.${ticket.status === 'in-progress' ? 'inProgress' : ticket.status}`)}
                      </Badge>
                    </td>
                    <td className="text-muted">{ticket.updated}</td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`}>
                        <Button variant="outline" className="btn-sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data-cell">
                    {t('tickets.noTickets')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Tickets;