import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import './TicketDetail.css';

// Mock detailed ticket with full timeline comments
const MOCK_TICKET_DETAILS = {
  id: 'T-1089',
  subject: 'Unable to connect custom domain',
  description: 'Hi support team, I am trying to attach my custom domain (domain.com) to my Supportly workspace, but CNAME verification keeps failing after 24 hours.',
  customer: { name: 'Sarah Jenkins', email: 'sarah@example.com' },
  assignee: 'Alex Rivera',
  priority: 'high',
  status: 'open',
  category: 'Domain & DNS',
  created: 'Sept 22, 2026 - 10:15 AM',
  timeline: [
    {
      id: 1,
      author: 'Sarah Jenkins',
      role: 'Customer',
      isInternal: false,
      timestamp: '10:15 AM',
      content: 'Hi support team, I am trying to attach my custom domain (domain.com) to my Supportly workspace, but CNAME verification keeps failing after 24 hours.'
    },
    {
      id: 2,
      author: 'Alex Rivera',
      role: 'Support Agent',
      isInternal: true,
      timestamp: '10:30 AM',
      content: 'Checked DNS propagation via Dig tools. Their registrar TTL is set to 86400. Need to verify their CAA records.'
    },
    {
      id: 3,
      author: 'Alex Rivera',
      role: 'Support Agent',
      isInternal: false,
      timestamp: '10:35 AM',
      content: 'Hello Sarah, thank you for reaching out! Could you please confirm if your DNS host has an existing CAA record restricting SSL issuance?'
    }
  ]
};

const TicketDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const [ticket, setTicket] = useState(MOCK_TICKET_DETAILS);
  const [activeTab, setActiveTab] = useState('reply'); // 'reply' or 'internal'
  const [message, setMessage] = useState('');

  const handleStatusChange = (e) => {
    setTicket({ ...ticket, status: e.target.value });
  };

  const handlePriorityChange = (e) => {
    setTicket({ ...ticket, priority: e.target.value });
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newComment = {
      id: Date.now(),
      author: 'You (Agent)',
      role: 'Support Agent',
      isInternal: activeTab === 'internal',
      timestamp: 'Just now',
      content: message
    };

    setTicket({
      ...ticket,
      timeline: [...ticket.timeline, newComment]
    });

    setMessage('');
  };

  return (
    <div className="ticket-detail-page">
      {/* Back Link */}
      <div className="back-navigation">
        <Link to="/tickets">← {t('ticketDetail.backToTickets')}</Link>
      </div>

      <div className="detail-layout">
        {/* Left Column: Conversation & Reply Box */}
        <div className="conversation-column">
          <Card className="ticket-header-card">
            <div className="ticket-title-row">
              <h2>{ticket.subject}</h2>
              <span className="ticket-id-tag">{ticket.id}</span>
            </div>
            <p className="ticket-meta-info">
              {t('ticketDetail.customer')}: <strong>{ticket.customer.name}</strong> ({ticket.customer.email}) • {ticket.created}
            </p>
          </Card>

          {/* Timeline Feed */}
          <div className="timeline-container">
            <h3 className="section-title">{t('ticketDetail.timeline')}</h3>
            {ticket.timeline.map((item) => (
              <div
                key={item.id}
                className={`timeline-card ${item.isInternal ? 'internal-note' : ''}`}
              >
                <div className="timeline-card-header">
                  <div className="author-info">
                    <span className="author-name">{item.author}</span>
                    <span className="author-role-badge">{item.role}</span>
                    {item.isInternal && <span className="internal-indicator">🔒 Internal Note</span>}
                  </div>
                  <span className="timeline-time">{item.timestamp}</span>
                </div>
                <div className="timeline-card-body">{item.content}</div>
              </div>
            ))}
          </div>

          {/* Response Box */}
          <Card className="reply-box-card">
            <div className="reply-tabs">
              <button
                className={`tab-btn ${activeTab === 'reply' ? 'active' : ''}`}
                onClick={() => setActiveTab('reply')}
              >
                💬 {t('ticketDetail.replyTab')}
              </button>
              <button
                className={`tab-btn internal ${activeTab === 'internal' ? 'active' : ''}`}
                onClick={() => setActiveTab('internal')}
              >
                🔒 {t('ticketDetail.internalNoteTab')}
              </button>
            </div>

            <form onSubmit={handlePostComment}>
              <textarea
                className={`reply-textarea ${activeTab === 'internal' ? 'internal-bg' : ''}`}
                rows="4"
                placeholder={activeTab === 'reply' ? t('ticketDetail.placeholderReply') : t('ticketDetail.placeholderNote')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="reply-actions">
                <Button type="submit" variant={activeTab === 'internal' ? 'secondary' : 'primary'}>
                  {activeTab === 'reply' ? t('ticketDetail.sendReply') : t('ticketDetail.saveNote')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Sidebar: Control Panel */}
        <div className="control-sidebar-column">
          <Card title={t('ticketDetail.updateDetails')}>
            <div className="control-group">
              <label>{t('ticketDetail.status')}</label>
              <select value={ticket.status} onChange={handleStatusChange} className="control-select">
                <option value="open">{t('status.open')}</option>
                <option value="in-progress">{t('status.inProgress')}</option>
                <option value="resolved">{t('status.resolved')}</option>
                <option value="closed">{t('status.closed')}</option>
              </select>
            </div>

            <div className="control-group">
              <label>{t('ticketDetail.priority')}</label>
              <select value={ticket.priority} onChange={handlePriorityChange} className="control-select">
                <option value="high">{t('priority.high')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="low">{t('priority.low')}</option>
              </select>
            </div>

            <div className="control-group">
              <label>{t('ticketDetail.assignee')}</label>
              <select defaultValue="Alex Rivera" className="control-select">
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Emily Wong">Emily Wong</option>
                <option value="unassigned">{t('ticketDetail.unassigned')}</option>
              </select>
            </div>

            <div className="control-group">
              <label>{t('ticketDetail.category')}</label>
              <input type="text" value={ticket.category} readOnly className="control-input-readonly" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;