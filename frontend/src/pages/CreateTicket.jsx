import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './CreateTicket.css';

const CATEGORIES = [
  'General Inquiry',
  'Billing & Subscription',
  'Domain & DNS',
  'API & Webhooks',
  'Bug Report',
  'Feature Request'
];

const CreateTicket = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    contactEmail: '',
    priority: 'medium',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrioritySelect = (p) => {
    setFormData({ ...formData, priority: p });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/tickets');
      }, 1200);
    }, 800);
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
            ✅ Ticket created successfully! Redirecting to ticket list...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ticket-form">
            <Input
              label={t('createTicket.subjectLabel')}
              name="subject"
              value={formData.subject}
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
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
                {['low', 'medium', 'high'].map((p) => (
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

            {/* Mock Attachment Upload */}
            <div className="form-group">
              <label className="form-label">{t('createTicket.attachmentsLabel')}</label>
              <div className="dropzone-area">
                <span className="dropzone-icon">📁</span>
                <p>{t('createTicket.dropzoneText')}</p>
              </div>
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
              <Button type="submit" variant="primary" isLoading={loading}>
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