import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MetricCard from '../components/dashboard/MetricCard';
import Button from '../components/common/Button';
import './Overview.css';

// Mock data matching backend response format
const MOCK_METRICS = {
  total: 1284,
  open: 42,
  inProgress: 18,
  resolved: 1224,
  avgResponseTime: '1h 12m',
};

const MOCK_RECENT_TICKETS = [
  { id: 'T-1089', subject: 'Unable to connect custom domain', customer: 'Sarah Jenkins', priority: 'high', status: 'open', created: '10 mins ago' },
  { id: 'T-1088', subject: 'Billing query regarding annual invoice', customer: 'Alex Rivera', priority: 'medium', status: 'in-progress', created: '25 mins ago' },
  { id: 'T-1087', subject: 'SSO Login failing for team members', customer: 'TechCorp Inc.', priority: 'high', status: 'open', created: '1 hour ago' },
  { id: 'T-1086', subject: 'Feature request: Dark mode export', customer: 'David Chen', priority: 'low', status: 'resolved', created: '3 hours ago' },
  { id: 'T-1085', subject: 'API Rate limit exceeded on webhooks', customer: 'StartupX', priority: 'medium', status: 'closed', created: '5 hours ago' },
];

const Overview = () => {
  const { t } = useTranslation();

  return (
    <div className="overview-page">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('overview.title')}</h1>
          <p className="page-subtitle">{t('overview.subtitle')}</p>
        </div>
        <Link to="/tickets/new">
          <Button variant="primary">➕ {t('nav.createTicket')}</Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <MetricCard
          title={t('overview.totalTickets')}
          value={MOCK_METRICS.total}
          change="12% vs last week"
          isPositive={true}
          icon="🎫"
        />
        <MetricCard
          title={t('overview.openTickets')}
          value={MOCK_METRICS.open}
          change="4 new today"
          isPositive={false}
          icon="📬"
        />
        <MetricCard
          title={t('overview.inProgress')}
          value={MOCK_METRICS.inProgress}
          change="2 active agents"
          isPositive={true}
          icon="⏳"
        />
        <MetricCard
          title={t('overview.avgResponseTime')}
          value={MOCK_METRICS.avgResponseTime}
          change="18m faster"
          isPositive={true}
          icon="⚡"
        />
      </div>

      {/* Analytics Visualization Section */}
      <div className="charts-row">
        <Card title={t('overview.ticketActivity')} className="chart-card">
          <div className="mock-chart-placeholder">
            <div className="bar" style={{ height: '40%' }}><span className="bar-label">Mon</span></div>
            <div className="bar" style={{ height: '65%' }}><span className="bar-label">Tue</span></div>
            <div className="bar" style={{ height: '85%' }}><span className="bar-label">Wed</span></div>
            <div className="bar" style={{ height: '50%' }}><span className="bar-label">Thu</span></div>
            <div className="bar active" style={{ height: '95%' }}><span className="bar-label">Fri</span></div>
            <div className="bar" style={{ height: '30%' }}><span className="bar-label">Sat</span></div>
            <div className="bar" style={{ height: '20%' }}><span className="bar-label">Sun</span></div>
          </div>
        </Card>

        <Card title={t('overview.priorityDistribution')} className="priority-card">
          <div className="priority-distribution-list">
            <div className="priority-item">
              <span className="priority-label"><Badge variant="priority-high">{t('priority.high')}</Badge></span>
              <div className="progress-bar"><div className="fill high" style={{ width: '25%' }}></div></div>
              <span className="priority-count">25%</span>
            </div>
            <div className="priority-item">
              <span className="priority-label"><Badge variant="priority-medium">{t('priority.medium')}</Badge></span>
              <div className="progress-bar"><div className="fill medium" style={{ width: '55%' }}></div></div>
              <span className="priority-count">55%</span>
            </div>
            <div className="priority-item">
              <span className="priority-label"><Badge variant="priority-low">{t('priority.low')}</Badge></span>
              <div className="progress-bar"><div className="fill low" style={{ width: '20%' }}></div></div>
              <span className="priority-count">20%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tickets Table */}
      <Card
        title={
          <div className="card-header-flex">
            <span>{t('overview.recentTickets')}</span>
            <Link to="/tickets" className="view-all-link">{t('overview.viewAll')} →</Link>
          </div>
        }
      >
        <div className="table-responsive">
          <table className="overview-table">
            <thead>
              <tr>
                <th>{t('overview.table.id')}</th>
                <th>{t('overview.table.subject')}</th>
                <th>{t('overview.table.customer')}</th>
                <th>{t('overview.table.priority')}</th>
                <th>{t('overview.table.status')}</th>
                <th>{t('overview.table.created')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECENT_TICKETS.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="ticket-id-cell">{ticket.id}</td>
                  <td className="ticket-subject-cell">{ticket.subject}</td>
                  <td>{ticket.customer}</td>
                  <td><Badge variant={`priority-${ticket.priority}`}>{t(`priority.${ticket.priority}`)}</Badge></td>
                  <td><Badge variant={`status-${ticket.status}`}>{t(`status.${ticket.status === 'in-progress' ? 'inProgress' : ticket.status}`)}</Badge></td>
                  <td className="text-muted">{ticket.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Overview;
