import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../constants/apiConstants';
import { ticketApi } from '../services/ticketApi';
import './Tickets.css';

const Tickets = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [result, setResult] = useState({ tickets: [], page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    ticketApi.list({ page, limit: 10, search: searchTerm || undefined, status: statusFilter === 'all' ? undefined : statusFilter, priority: priorityFilter === 'all' ? undefined : priorityFilter })
      .then((data) => active && setResult(data))
      .catch((requestError) => active && setError(requestError.response?.status === 401 ? 'You are not authorized to view tickets.' : 'Unable to load tickets.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, searchTerm, statusFilter, priorityFilter]);

  const tickets = result.tickets;

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
              <option value={TICKET_STATUSES.OPEN}>{t('status.open')}</option>
              <option value={TICKET_STATUSES.IN_PROGRESS}>{t('status.inProgress')}</option>
              <option value={TICKET_STATUSES.RESOLVED}>{t('status.resolved')}</option>
              <option value={TICKET_STATUSES.CLOSED}>{t('status.closed')}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('tickets.filterPriority')}</option>
              <option value={TICKET_PRIORITIES.HIGH}>{t('priority.high')}</option>
              <option value={TICKET_PRIORITIES.MEDIUM}>{t('priority.medium')}</option>
              <option value={TICKET_PRIORITIES.LOW}>{t('priority.low')}</option>
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
              {loading ? <tr><td colSpan="8" className="no-data-cell">Loading tickets...</td></tr> : error ? <tr><td colSpan="8" className="no-data-cell">{error}</td></tr> : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td className="ticket-id-cell">{ticket.ticketNumber}</td>
                    <td className="ticket-subject-cell">
                      <Link to={`/tickets/${ticket.ticketNumber || ticket._id}`} className="subject-link">
                        {ticket.title}
                      </Link>
                    </td>
                    <td>{ticket.user?.name || 'Unknown'}</td>
                    <td>
                      <span className="assignee-badge">{ticket.assignedTo?.name || 'Unassigned'}</span>
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
                    <td className="text-muted">{new Date(ticket.updatedAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/tickets/${ticket.ticketNumber || ticket._id}`}>
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
      <div className="pagination-controls">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
        <span>Page {result.page} of {result.pages}</span>
        <Button variant="outline" disabled={page >= result.pages} onClick={() => setPage((current) => current + 1)}>Next</Button>
      </div>
    </div>
  );
};

export default Tickets;