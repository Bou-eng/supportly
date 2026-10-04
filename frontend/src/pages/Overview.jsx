import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MetricCard from '../components/dashboard/MetricCard';
import Button from '../components/common/Button';
import { reportApi } from '../services/reportApi';
import { ticketApi } from '../services/ticketApi';
import './Overview.css';

const Overview = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([reportApi.summary({}), ticketApi.list({ limit: 5 })])
      .then(([summaryData, ticketData]) => { setSummary(summaryData); setRecentTickets(ticketData.tickets || []); })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="overview-page"><Card>Loading dashboard...</Card></div>;
  if (error) return <div className="overview-page"><Card>{error}</Card></div>;

  const metrics = summary?.overview || {};
  const priorities = summary?.byPriority || {};
  const total = Object.values(priorities).reduce((sum, count) => sum + count, 0) || 1;

  return (
    <div className="overview-page">
      <div className="page-header"><div><h1 className="page-title">{t('overview.title')}</h1><p className="page-subtitle">{t('overview.subtitle')}</p></div><Link to="/tickets/new"><Button variant="primary">+ {t('nav.createTicket')}</Button></Link></div>
      <div className="metrics-grid">
        <MetricCard title={t('overview.totalTickets')} value={metrics.totalTickets || 0} change="Selected date range" isPositive icon="🎫" />
        <MetricCard title={t('overview.openTickets')} value={metrics.openTickets || 0} change={`${metrics.unassignedTickets || 0} unassigned`} isPositive={false} icon="📬" />
        <MetricCard title="Resolved today" value={metrics.resolvedToday || 0} change={`${metrics.averageResolutionTime || '0m'} average resolution`} isPositive icon="✅" />
        <MetricCard title={t('overview.avgResponseTime')} value={metrics.averageFirstResponse || '0m'} change={`${metrics.averageResolutionTime || '0m'} resolution`} isPositive icon="⚡" />
      </div>
      <div className="charts-row">
        <Card title={t('overview.priorityDistribution')} className="priority-card"><div className="priority-distribution-list">{['high', 'medium', 'low', 'urgent'].map((priority) => <div className="priority-item" key={priority}><span className="priority-label"><Badge variant={`priority-${priority}`}>{t(`priority.${priority}`)}</Badge></span><div className="progress-bar"><div className={`fill ${priority}`} style={{ width: `${Math.round(((priorities[priority] || 0) / total) * 100)}%` }} /></div><span className="priority-count">{priorities[priority] || 0}</span></div>)}</div></Card>
        <Card title="Ticket status"><div className="priority-distribution-list">{Object.entries(summary?.byStatus || {}).map(([status, count]) => <div className="priority-item" key={status}><Badge variant={`status-${status}`}>{status}</Badge><span className="priority-count">{count}</span></div>)}</div></Card>
      </div>
      <Card title={<div className="card-header-flex"><span>{t('overview.recentTickets')}</span><Link to="/tickets" className="view-all-link">{t('overview.viewAll')} →</Link></div>}>
        {recentTickets.length === 0 ? <p>No tickets found.</p> : <div className="table-responsive"><table className="overview-table"><thead><tr><th>ID</th><th>Title</th><th>Customer</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>{recentTickets.map((ticket) => <tr key={ticket._id}><td>{ticket.ticketNumber}</td><td>{ticket.title}</td><td>{ticket.user?.name || 'Unknown'}</td><td><Badge variant={`priority-${ticket.priority}`}>{ticket.priority}</Badge></td><td><Badge variant={`status-${ticket.status}`}>{ticket.status}</Badge></td><td>{new Date(ticket.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
      </Card>
    </div>
  );
};

export default Overview;
