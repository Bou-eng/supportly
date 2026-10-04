import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import { reportApi } from '../services/reportApi';
import './Reports.css';

const getDates = (range) => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - Number(range));
  return { from: from.toISOString(), to: to.toISOString() };
};

const Reports = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = getDates(timeRange);
    setLoading(true);
        Promise.all([reportApi.summary(params), reportApi.agentPerformance(params), reportApi.teamWorkload(params), reportApi.ticketVolume(params)])
          .then(([summary, agents, teams, volume]) => setData({ summary, agents: agents.agents || [], teams: teams.teams || [], volume: volume.volume || [] }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load reports.'))
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) return <div className="reports-page"><Card>Loading reports...</Card></div>;
  if (error) return <div className="reports-page"><Card>{error}</Card></div>;

  const metrics = data.summary.overview;
  return (
    <div className="reports-page">
      <div className="page-header"><div><h1 className="page-title">{t('reports.title')}</h1><p className="page-subtitle">{t('reports.subtitle')}</p></div><select className="form-select" value={timeRange} onChange={(event) => setTimeRange(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>
      <div className="stats-grid">{[['Total tickets', metrics.totalTickets], ['Open tickets', metrics.openTickets], ['Resolved today', metrics.resolvedToday], ['Unassigned', metrics.unassignedTickets], ['Avg first response', metrics.averageFirstResponse], ['Avg resolution', metrics.averageResolutionTime]].map(([label, value]) => <Card className="stat-card" key={label}><span className="stat-label">{label}</span><span className="stat-value">{value || 0}</span></Card>)}</div>
            <div className="reports-grid"><Card className="report-card"><h3 className="card-title">Ticket volume</h3><div className="volume-chart">{data.volume.length === 0 ? <p>No volume data.</p> : data.volume.map((point) => <div className="volume-bar" key={point.date} title={`${point.date}: ${point.total}`}><div style={{ height: `${Math.max((point.total / Math.max(...data.volume.map((item) => item.total), 1)) * 100, 4)}%` }} /><small>{point.date.slice(5)}</small></div>)}</div></Card><Card className="report-card"><h3 className="card-title">Tickets by status</h3>{Object.entries(data.summary.byStatus || {}).map(([status, count]) => <div className="status-item" key={status}><div className="status-info"><span>{status}</span><span className="status-count">{count}</span></div><div className="progress-bar"><div className="progress-fill open" style={{ width: `${Math.min(count / Math.max(metrics.totalTickets, 1) * 100, 100)}%` }} /></div></div>)}</Card><Card className="report-card"><h3 className="card-title">Tickets by priority</h3>{Object.entries(data.summary.byPriority || {}).map(([priority, count]) => <div className="status-item" key={priority}><div className="status-info"><span>{priority}</span><span className="status-count">{count}</span></div></div>)}</Card></div>
      <Card className="agent-table-card"><h3 className="card-title">Agent performance</h3><div className="table-responsive"><table className="reports-table"><thead><tr><th>Agent</th><th>Assigned</th><th>Resolved</th><th>Average resolution</th></tr></thead><tbody>{data.agents.length === 0 ? <tr><td colSpan="4">No agent data.</td></tr> : data.agents.map((row) => <tr key={row.agent._id}><td>{row.agent.name}</td><td>{row.assigned}</td><td>{row.resolved}</td><td>{row.averageResolution}</td></tr>)}</tbody></table></div></Card>
      <Card className="agent-table-card"><h3 className="card-title">Team workload</h3><div className="table-responsive"><table className="reports-table"><thead><tr><th>Team</th><th>Total</th><th>Open</th><th>Unassigned</th></tr></thead><tbody>{data.teams.length === 0 ? <tr><td colSpan="4">No team data.</td></tr> : data.teams.map((team) => <tr key={team.teamId || team.teamName}><td>{team.teamName}</td><td>{team.total}</td><td>{team.open}</td><td>{team.unassigned}</td></tr>)}</tbody></table></div></Card>
    </div>
  );
};

export default Reports;
