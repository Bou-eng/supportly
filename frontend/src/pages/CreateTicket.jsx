import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { TICKET_PRIORITIES } from '../constants/apiConstants';
import { ticketApi } from '../services/ticketApi';
import { categoryApi } from '../services/categoryApi';
import { useActionLock } from '../hooks/useActionLock';
import './CreateTicket.css';

const getCreateTicketErrorKey = (requestError) => {
  const serverMessage = requestError.response?.data?.message || '';

  if (serverMessage === 'Category not found') {
    return 'createTicket.errors.categoryNotFound';
  }

  if (
    serverMessage.includes('Ticket validation failed')
    && serverMessage.includes('category')
    && serverMessage.includes('Cast to ObjectId')
  ) {
    return 'createTicket.errors.categoryCast';
  }

  return 'createTicket.errors.createFailed';
};

const CreateTicket = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    contactEmail: '',
    priority: 'medium',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { locked: submitting, runOnce: runSubmitOnce } = useActionLock();

  useEffect(() => {
    categoryApi.list()
      .then(setCategories)
      .catch(() => setError('createTicket.errors.categoriesLoad'))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrioritySelect = (p) => {
    setFormData({ ...formData, priority: p });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await runSubmitOnce(async () => {
      setLoading(true);
      setError('');
      try {
        const createdTicket = await ticketApi.create({ title: formData.title, description: formData.description, contactEmail: formData.contactEmail, category: formData.category, priority: formData.priority });
        if (attachments.length > 0) {
          const message = await ticketApi.reply(createdTicket.ticketNumber || createdTicket._id, 'Attachments added to this ticket.', 'public', attachments);
          if (message.attachments?.length !== attachments.length) {
            throw new Error('The selected attachments were not uploaded.');
          }
        }
        setSuccess(true);
        setTimeout(() => navigate('/tickets'), 1200);
      } catch (requestError) {
        setError(getCreateTicketErrorKey(requestError));
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="create-ticket-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('createTicket.title')}</h1>
          <p className="page-subtitle">{t('createTicket.subtitle')}</p>
        </div>
      </div>

      <Card className="form-card">
        {success ? (
          <div className="success-banner">
            ✅ {t('createTicket.successMsg')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ticket-form">
            {error && <div className="auth-error-banner">{t(error)}</div>}
            <Input
              label={t('createTicket.subjectLabel')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('createTicket.subjectPlaceholder')}
              required
            />

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">{t('createTicket.categoryLabel')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="" disabled>
                    {t('createTicket.categoryPlaceholder')}
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={t('createTicket.contactEmailLabel')}
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder={t('createTicket.contactEmailPlaceholder')}
                required
              />
            </div>

            {/* Priority Selector */}
            <div className="form-group">
              <label className="form-label">{t('createTicket.priorityLabel')}</label>
              <div className="priority-selector">
                {[TICKET_PRIORITIES.LOW, TICKET_PRIORITIES.MEDIUM, TICKET_PRIORITIES.HIGH].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${formData.priority === p ? 'selected' : ''}`}
                    onClick={() => handlePrioritySelect(p)}
                  >
                    <Badge variant={`priority-${p}`}>{t(`priority.${p}`)}</Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-group">
              <label className="form-label">{t('createTicket.descriptionLabel')}</label>
              <textarea
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('createTicket.descriptionPlaceholder')}
                className="form-textarea"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('createTicket.attachmentsLabel')}</label>
              <label className="dropzone-area">
                <span className="dropzone-icon">📁</span>
                <p>{t('createTicket.dropzoneText')}</p>
                <input type="file" multiple accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,text/csv" onChange={(event) => setAttachments(Array.from(event.target.files || []))} hidden />
                {attachments.length > 0 && <small>{attachments.length} attachment(s) selected</small>}
              </label>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tickets')}
              >
                {t('createTicket.cancelBtn')}
              </Button>
              <Button type="submit" variant="primary" isLoading={loading || submitting} disabled={submitting}>
                {t('createTicket.submitBtn')} →
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default CreateTicket;
