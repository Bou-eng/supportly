import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { TICKET_PRIORITIES, TICKET_STATUSES, USER_ROLES } from '../constants/apiConstants';
import { ticketApi } from '../services/ticketApi';
import { useActionLock } from '../hooks/useActionLock';
import './TicketDetail.css';

const CATEGORY_CAST_ERROR_PARTS = ['Ticket validation failed', 'category', 'Cast to ObjectId'];

const getTicketDetailErrorKey = (requestError, fallbackKey) => {
  const status = requestError.response?.status;
  if (status === 401 || status === 403) {
    return 'ticketDetail.errors.unauthorized';
  }

  const serverMessage = requestError.response?.data?.message || '';
  if (CATEGORY_CAST_ERROR_PARTS.every((part) => serverMessage.includes(part))) {
    return 'ticketDetail.errors.categoryCast';
  }

  if (serverMessage === 'Ticket not found') {
    return 'ticketDetail.errors.notFound';
  }

  if (serverMessage === 'Category not found') {
    return 'ticketDetail.errors.categoryNotFound';
  }

  return fallbackKey;
};

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAttachmentIcon = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  return '📎';
};

const TicketDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { role } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('reply');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tag, setTag] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { locked: messageBusy, runOnce: runMessageOnce } = useActionLock();
  const { locked: downloadBusy, runOnce: runDownloadOnce } = useActionLock();

  const getSlaState = () => {
    if (!ticket?.slaDueAt) return 'sla-unknown';
    const remaining = new Date(ticket.slaDueAt).getTime() - Date.now();
    if (remaining <= 0) return 'sla-breached';
    if (remaining <= 2 * 60 * 60 * 1000) return 'sla-warning';
    return 'sla-on-track';
  };

  const ticketAttachments = messages.flatMap((item) => (
    (item.attachments || []).map((attachment) => ({ attachment, messageId: item._id }))
  ));

  const downloadAttachment = async (messageId, attachmentId) => {
    await runDownloadOnce(async () => {
      try {
        const result = await ticketApi.attachmentUrl(id, messageId, attachmentId);
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } catch (requestError) {
        setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.downloadAttachment'));
      }
    });
  };

  const refreshActivity = async () => {
    if (role !== USER_ROLES.CUSTOMER) {
      setActivity(await ticketApi.activity(id));
    }
  };

  useEffect(() => {
    const requests = [ticketApi.get(id), ticketApi.messages(id)];
    if (role !== USER_ROLES.CUSTOMER) requests.push(ticketApi.activity(id));
    Promise.all(requests)
      .then(([ticketData, messageData, activityData = []]) => { setTicket(ticketData); setAssigneeId(ticketData.assignedTo?._id || ''); setMessages(messageData); setActivity(activityData); })
      .catch((requestError) => setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.load')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (e) => {
    setSaving(true);
    setError('');
    try { setTicket(await ticketApi.updateStatus(id, e.target.value)); await refreshActivity(); } catch (requestError) { setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.updateStatus')); } finally { setSaving(false); }
  };

  const handlePriorityChange = async (e) => {
    setSaving(true);
    setError('');
    try { setTicket(await ticketApi.updatePriority(id, e.target.value)); await refreshActivity(); } catch (requestError) { setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.updatePriority')); } finally { setSaving(false); }
  };

  const handleTagAdd = async (e) => {
    e.preventDefault();
    if (!tag.trim()) return;
    setError('');
    try { setTicket(await ticketApi.update(id, { tags: [...(ticket.tags || []), tag.trim()] })); setTag(''); await refreshActivity(); } catch (requestError) { setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.updateTags')); }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await runMessageOnce(async () => {
      setError('');
      try {
        const newMessage = await ticketApi.reply(id, message.trim(), activeTab === 'internal' ? 'internal' : 'public', attachments);
        setMessages((current) => [...current, newMessage]);
        setMessage('');
        setAttachments([]);
        await refreshActivity();
      } catch (requestError) { setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.sendReply')); }
    });
  };

  if (loading) return <div className="ticket-detail-page"><Card>{t('ticketDetail.loading')}</Card></div>;
  if (error && !ticket) return <div className="ticket-detail-page"><Card>{t(error)}</Card></div>;
  if (!ticket) return <div className="ticket-detail-page"><Card>{t('ticketDetail.errors.notFound')}</Card></div>;

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
              <h2>{ticket.title}</h2>
              <span className="ticket-id-tag">{ticket.ticketNumber}</span>
            </div>
            <p className="ticket-meta-info">
              {t('ticketDetail.customer')}: <strong>{ticket.user?.name}</strong> ({ticket.user?.email}) • {new Date(ticket.createdAt).toLocaleString()}
            </p>
            <p>{ticket.description}</p>
            <div className={`sla-status ${getSlaState()}`}>
              SLA: {ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleString() : 'Not set'}
            </div>
            {error && <div className="auth-error-banner">{t(error)}</div>}
          </Card>

          {ticketAttachments.length > 0 && <Card className="ticket-attachments-card" title={`Attachments (${ticketAttachments.length})`}>
            <div className="attachment-list ticket-attachments-list">
              {ticketAttachments.map(({ attachment, messageId }) => <button disabled={downloadBusy} key={`${messageId}-${attachment._id}`} type="button" className="attachment-link" onClick={() => downloadAttachment(messageId, attachment._id)}>
                <span className="attachment-icon">{getAttachmentIcon(attachment.mimeType)}</span>
                <span className="attachment-details"><strong>{attachment.name}</strong><small>{formatFileSize(attachment.bytes)} · {attachment.mimeType}</small></span>
                <span className="attachment-download">Download</span>
              </button>)}
            </div>
          </Card>}

          {/* Timeline Feed */}
          <div className="timeline-container">
            <h3 className="section-title">{t('ticketDetail.timeline')}</h3>
            {messages.length === 0 ? <p>{t('ticketDetail.noMessages')}</p> : messages.map((item) => (
              <div
                key={item._id}
                className={`timeline-card ${item.type === 'internal' ? 'internal-note' : ''}`}
              >
                <div className="timeline-card-header">
                  <div className="author-info">
                    <span className="author-name">{item.author?.name}</span>
                    <span className="author-role-badge">{item.author?.role}</span>
                    {item.type === 'internal' && <span className="internal-indicator">🔒 {t('ticketDetail.internalNoteTab')}</span>}
                  </div>
                  <span className="timeline-time">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="timeline-card-body">{item.content}</div>
                {item.attachments?.length > 0 && <div className="attachment-panel">
                  <div className="attachment-panel-heading">Attachments ({item.attachments.length})</div>
                  <div className="attachment-list">
                  {item.attachments.map((attachment) => <button disabled={downloadBusy} key={attachment._id} type="button" className="attachment-link" onClick={() => downloadAttachment(item._id, attachment._id)}><span className="attachment-icon">{getAttachmentIcon(attachment.mimeType)}</span><span className="attachment-details"><strong>{attachment.name}</strong><small>{formatFileSize(attachment.bytes)} · {attachment.mimeType}</small></span><span className="attachment-download">Download</span></button>)}
                  </div>
                </div>}
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
              {role !== USER_ROLES.CUSTOMER && <button
                className={`tab-btn internal ${activeTab === 'internal' ? 'active' : ''}`}
                onClick={() => setActiveTab('internal')}
              >
                🔒 {t('ticketDetail.internalNoteTab')}
              </button>}
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
              <input type="file" multiple accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,text/csv" onChange={(event) => setAttachments(Array.from(event.target.files || []))} />
              {attachments.length > 0 && <small>{attachments.length} attachment(s) selected</small>}
              <div className="reply-actions">
                <Button type="submit" disabled={messageBusy} isLoading={saving || messageBusy} variant={activeTab === 'internal' ? 'secondary' : 'primary'}>
                  {activeTab === 'reply' ? t('ticketDetail.sendReply') : t('ticketDetail.saveNote')}
                </Button>
              </div>
            </form>
          </Card>

          {role !== USER_ROLES.CUSTOMER && <Card title={t('ticketDetail.activityHistory')} className="activity-card">
            {activity.length === 0 ? <p>{t('ticketDetail.noActivity')}</p> : activity.map((item) => (
              <div key={item._id} className="timeline-card">
                <div className="timeline-card-header">
                  <span className="author-name">{item.actor?.name || t('ticketDetail.system')}</span>
                  <span className="timeline-time">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="timeline-card-body">{item.action}: {item.newValue || t('ticketDetail.updated')}</div>
              </div>
            ))}
          </Card>}
        </div>

        {/* Right Sidebar: Control Panel */}
        <div className="control-sidebar-column">
          <Card title={t('ticketDetail.updateDetails')}>
            <div className="control-group">
              <label>{t('ticketDetail.status')}</label>
              <select disabled={role === USER_ROLES.CUSTOMER} value={ticket.status} onChange={handleStatusChange} className="control-select">
                <option value={TICKET_STATUSES.OPEN}>{t('status.open')}</option>
                <option value={TICKET_STATUSES.IN_PROGRESS}>{t('status.inProgress')}</option>
                <option value={TICKET_STATUSES.RESOLVED}>{t('status.resolved')}</option>
                <option value={TICKET_STATUSES.CLOSED}>{t('status.closed')}</option>
              </select>
            </div>

            <div className="control-group">
              <label>{t('ticketDetail.priority')}</label>
              <select disabled={role === USER_ROLES.CUSTOMER} value={ticket.priority} onChange={handlePriorityChange} className="control-select">
                <option value={TICKET_PRIORITIES.HIGH}>{t('priority.high')}</option>
                <option value={TICKET_PRIORITIES.MEDIUM}>{t('priority.medium')}</option>
                <option value={TICKET_PRIORITIES.LOW}>{t('priority.low')}</option>
              </select>
            </div>

            <div className="control-group">
              <label>{t('ticketDetail.assignee')}</label>
              <input disabled={role === USER_ROLES.CUSTOMER} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} onBlur={() => ticketApi.assign(id, assigneeId).then(async (updated) => { setError(''); setTicket(updated); await refreshActivity(); }).catch((requestError) => setError(getTicketDetailErrorKey(requestError, 'ticketDetail.errors.assign')))} placeholder={t('ticketDetail.assigneePlaceholder')} className="control-select" />
            </div>

            <div className="control-group">
              <label>{t('ticketDetail.category')}</label>
              <input type="text" value={ticket.category?.name || ''} readOnly className="control-input-readonly" />
            </div>
            <form onSubmit={handleTagAdd} className="control-group">
              <label>{t('ticketDetail.tags')}</label>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder={t('ticketDetail.addTag')} className="control-input-readonly" disabled={role === USER_ROLES.CUSTOMER} />
            </form>
            <div className="control-group"><label>{t('ticketDetail.team')}</label><input value={ticket.team?.name || ''} readOnly className="control-input-readonly" /></div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
