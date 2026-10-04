import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { TICKET_STATUSES } from '../constants/apiConstants';
import { ticketApi } from '../services/ticketApi';
import { useActionLock } from '../hooks/useActionLock';
import './TeamQueue.css';

const STAGES = [TICKET_STATUSES.OPEN, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED];

const TeamQueue = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moving, setMoving] = useState('');
  const { runOnce } = useActionLock();

  const loadTickets = async () => {
    try {
      const result = await ticketApi.list({ limit: 100 });
      setTickets(result.tickets || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load team queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const moveTicket = async (ticket, nextStatus) => {
    await runOnce(async () => {
      setMoving(ticket._id);
      try {
        const updated = await ticketApi.updateStatus(ticket.ticketNumber || ticket._id, nextStatus);
        setTickets((current) => current.map((item) => item._id === updated._id ? updated : item));
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to update ticket status.');
      } finally {
        setMoving('');
      }
    });
  };

  const getStageKey = (stage) => stage === TICKET_STATUSES.IN_PROGRESS ? 'inProgress' : stage;

  if (loading) return <div className="team-queue-page"><Card>Loading team queue...</Card></div>;

  return <div className="team-queue-page">
    <div className="page-header"><div><h1 className="page-title">{t('teamQueue.title')}</h1><p className="page-subtitle">{t('teamQueue.subtitle')}</p></div></div>
    {error && <Card className="no-results-card"><p>{error}</p></Card>}
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const stageTickets = tickets.filter((ticket) => ticket.status === stage);
        return <div key={stage} className="kanban-column"><div className="column-header"><span className="column-title">{t(`teamQueue.columns.${getStageKey(stage)}`)}</span><span className="column-count">{stageTickets.length}</span></div><div className="column-cards">
          {stageTickets.length === 0 ? <div className="empty-column-placeholder">{t('teamQueue.emptyColumn')}</div> : stageTickets.map((ticket) => <Card key={ticket._id} className="kanban-card"><div className="kanban-card-top"><span className="ticket-id">{ticket.ticketNumber}</span><Badge variant={`priority-${ticket.priority}`}>{t(`priority.${ticket.priority}`)}</Badge></div><Link to={`/tickets/${ticket.ticketNumber || ticket._id}`} className="kanban-card-subject">{ticket.title}</Link><div className="kanban-card-meta"><span className="customer-name">👤 {ticket.user?.name || 'Unknown'}</span><span className="assignee-tag">📌 {ticket.assignedTo?.name || 'Unassigned'}</span></div><div className="kanban-card-actions">{stage !== STAGES[0] && <button disabled={moving === ticket._id} onClick={() => moveTicket(ticket, STAGES[STAGES.indexOf(stage) - 1])} className="move-btn" title="Move Left">←</button>}{stage !== STAGES.at(-1) && <button disabled={moving === ticket._id} onClick={() => moveTicket(ticket, STAGES[STAGES.indexOf(stage) + 1])} className="move-btn" title="Move Right">→</button>}</div></Card>)}
        </div></div>;
      })}
    </div>
  </div>;
};

export default TeamQueue;
