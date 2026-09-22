import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import './TeamQueue.css';

const INITIAL_TICKETS = [
  { id: 'T-1089', subject: 'Unable to connect custom domain', customer: 'Sarah Jenkins', assignee: 'Alex R.', priority: 'high', status: 'open' },
  { id: 'T-1088', subject: 'Billing query regarding annual invoice', customer: 'Alex Rivera', assignee: 'Me', priority: 'medium', status: 'in-progress' },
  { id: 'T-1087', subject: 'SSO Login failing for team members', customer: 'TechCorp Inc.', assignee: 'Unassigned', priority: 'high', status: 'open' },
  { id: 'T-1086', subject: 'Feature request: Dark mode export', customer: 'David Chen', assignee: 'Me', priority: 'low', status: 'resolved' },
  { id: 'T-1085', subject: 'API Rate limit exceeded on webhooks', customer: 'StartupX', assignee: 'Emily W.', priority: 'medium', status: 'closed' },
  { id: 'T-1084', subject: 'OAuth token refresh failing in Node SDK', customer: 'DevOps Team', assignee: 'Me', priority: 'high', status: 'in-progress' },
];

const STAGES = ['open', 'in-progress', 'resolved', 'closed'];

const TeamQueue = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  // Quick action to move ticket across columns
  const moveTicket = (ticketId, nextStatus) => {
    setTickets((prev) =>
      prev.map((item) => (item.id === ticketId ? { ...item, status: nextStatus } : item))
    );
  };

  const getStageKey = (stage) => {
    if (stage === 'in-progress') return 'inProgress';
    return stage;
  };

  return (
    <div className="team-queue-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teamQueue.title')}</h1>
          <p className="page-subtitle">{t('teamQueue.subtitle')}</p>
        </div>
      </div>

      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageTickets = tickets.filter((t) => t.status === stage);

          return (
            <div key={stage} className="kanban-column">
              <div className="column-header">
                <span className="column-title">{t(`teamQueue.columns.${getStageKey(stage)}`)}</span>
                <span className="column-count">{stageTickets.length}</span>
              </div>

              <div className="column-cards">
                {stageTickets.length > 0 ? (
                  stageTickets.map((ticket) => (
                    <Card key={ticket.id} className="kanban-card">
                      <div className="kanban-card-top">
                        <span className="ticket-id">{ticket.id}</span>
                        <Badge variant={`priority-${ticket.priority}`}>
                          {t(`priority.${ticket.priority}`)}
                        </Badge>
                      </div>

                      <Link to={`/tickets/${ticket.id}`} className="kanban-card-subject">
                        {ticket.subject}
                      </Link>

                      <div className="kanban-card-meta">
                        <span className="customer-name">👤 {ticket.customer}</span>
                        <span className="assignee-tag">📌 {ticket.assignee}</span>
                      </div>

                      {/* Status Transition Quick Controls */}
                      <div className="kanban-card-actions">
                        {stage !== 'open' && (
                          <button
                            onClick={() => moveTicket(ticket.id, STAGES[STAGES.indexOf(stage) - 1])}
                            className="move-btn"
                            title="Move Left"
                          >
                            ←
                          </button>
                        )}
                        {stage !== 'closed' && (
                          <button
                            onClick={() => moveTicket(ticket.id, STAGES[STAGES.indexOf(stage) + 1])}
                            className="move-btn"
                            title="Move Right"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="empty-column-placeholder">
                    {t('teamQueue.emptyColumn')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamQueue;