import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import './Reports.css';

const MOCK_AGENT_PERFORMANCE = [
  { id: 1, name: 'Alex Rivera', assigned: 48, resolved: 45, avgTime: '1.8 hrs', rating: '4.9 / 5.0' },
  { id: 2, name: 'Sarah Chen', assigned: 52, resolved: 50, avgTime: '1.2 hrs', rating: '4.95 / 5.0' },
  { id: 3, name: 'Michael Scott', assigned: 34, resolved: 28, avgTime: '3.4 hrs', rating: '4.2 / 5.0' },
  { id: 4, name: 'Emma Watson', assigned: 41, resolved: 39, avgTime: '2.1 hrs', rating: '4.8 / 5.0' },
];

const Reports = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('reports.title')}</h1>
          <p className="page-subtitle">{t('reports.subtitle')}</p>
        </div>
        <div className="time-range-picker">
          <select
            className="form-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">{t('reports.timeRange.7d')}</option>
            <option value="30d">{t('reports.timeRange.30d')}</option>
            <option value="90d">{t('reports.timeRange.90d')}</option>
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <span className="stat-label">{t('reports.metrics.totalTickets')}</span>
          <span className="stat-value">1,248</span>
          <span className="stat-trend positive">↑ 12% vs last period</span>
        </Card>
        <Card className="stat-card">
          <span className="stat-label">{t('reports.metrics.resolvedTickets')}</span>
          <span className="stat-value">1,180</span>
          <span className="stat-trend positive">↑ 98% resolution rate</span>
        </Card>
        <Card className="stat-card">
          <span className="stat-label">{t('reports.metrics.avgResponseTime')}</span>
          <span className="stat-value">1.4 hrs</span>
          <span className="stat-trend positive">↓ 18m improvement</span>
        </Card>
        <Card className="stat-card">
          <span className="stat-label">{t('reports.metrics.csatScore')}</span>
          <span className="stat-value">94.8%</span>
          <span className="stat-trend positive">★ 4.8 / 5.0 Avg</span>
        </Card>
      </div>

      {/* Visual Data Section */}
      <div className="reports-grid">
        <Card className="report-card">
          <h3 className="card-title">{t('reports.charts.volumeTitle')}</h3>
          <div className="chart-placeholder">
            <div className="bar-chart">
              <div className="bar-group">
                <div className="bar" style={{ height: '60%' }}></div>
                <span>Mon</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '85%' }}></div>
                <span>Tue</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '45%' }}></div>
                <span>Wed</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '90%' }}></div>
                <span>Thu</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '70%' }}></div>
                <span>Fri</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '30%' }}></div>
                <span>Sat</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: '20%' }}></div>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="report-card">
          <h3 className="card-title">{t('reports.charts.statusTitle')}</h3>
          <div className="status-breakdown">
            <div className="status-item">
              <div className="status-info">
                <span>Resolved</span>
                <span className="status-count">1,180 (94%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill resolved" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div className="status-item">
              <div className="status-info">
                <span>In Progress</span>
                <span className="status-count">42 (3%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill progress" style={{ width: '3%' }}></div>
              </div>
            </div>
            <div className="status-item">
              <div className="status-info">
                <span>Open / New</span>
                <span className="status-count">26 (2%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill open" style={{ width: '2%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <Card className="agent-table-card">
        <h3 className="card-title">{t('reports.charts.agentPerformance')}</h3>
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>{t('reports.table.agent')}</th>
                <th>{t('reports.table.assigned')}</th>
                <th>{t('reports.table.resolved')}</th>
                <th>{t('reports.table.avgTime')}</th>
                <th>{t('reports.table.rating')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AGENT_PERFORMANCE.map((agent) => (
                <tr key={agent.id}>
                  <td className="agent-cell">
                    <div className="avatar">{agent.name.charAt(0)}</div>
                    <span className="agent-name">{agent.name}</span>
                  </td>
                  <td>{agent.assigned}</td>
                  <td>{agent.resolved}</td>
                  <td>{agent.avgTime}</td>
                  <td className="rating-cell">⭐ {agent.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;