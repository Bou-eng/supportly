import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Settings.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex@supportly.io',
    language: i18n.language || 'en',
  });

  // Workspace Form State
  const [workspace, setWorkspace] = useState({
    name: 'Supportly Corp',
    domain: 'supportly-help.supportly.io',
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    ticketAssigned: true,
    ticketUpdated: true,
    weeklyReport: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (profile.language !== i18n.language) {
      i18n.changeLanguage(profile.language);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-subtitle">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 {t('settings.tabs.profile')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            🏢 {t('settings.tabs.workspace')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 {t('settings.tabs.notifications')}
          </button>
        </div>

        <div className="settings-content">
          {saved && <div className="success-banner">✅ {t('settings.successMsg')}</div>}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="section-title">{t('settings.profile.title')}</h2>
              <form onSubmit={handleSave} className="settings-form">
                <Input
                  label={t('settings.profile.fullName')}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <Input
                  label={t('settings.profile.email')}
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                <div className="form-group">
                  <label className="form-label">{t('settings.profile.language')}</label>
                  <select
                    className="form-select"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
                <div>
                  <Button type="submit" variant="primary">
                    {t('settings.profile.saveBtn')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Workspace Tab */}
          {activeTab === 'workspace' && (
            <Card>
              <h2 className="section-title">{t('settings.workspace.title')}</h2>
              <form onSubmit={handleSave} className="settings-form">
                <Input
                  label={t('settings.workspace.name')}
                  value={workspace.name}
                  onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                />
                <Input
                  label={t('settings.workspace.domain')}
                  value={workspace.domain}
                  onChange={(e) => setWorkspace({ ...workspace, domain: e.target.value })}
                />
                <div>
                  <Button type="submit" variant="primary">
                    {t('settings.workspace.saveBtn')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="section-title">{t('settings.notifications.title')}</h2>
              <form onSubmit={handleSave} className="settings-form">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.ticketAssigned}
                    onChange={(e) =>
                      setNotifications({ ...notifications, ticketAssigned: e.target.checked })
                    }
                  />
                  <span>{t('settings.notifications.ticketAssigned')}</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.ticketUpdated}
                    onChange={(e) =>
                      setNotifications({ ...notifications, ticketUpdated: e.target.checked })
                    }
                  />
                  <span>{t('settings.notifications.ticketUpdated')}</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReport}
                    onChange={(e) =>
                      setNotifications({ ...notifications, weeklyReport: e.target.checked })
                    }
                  />
                  <span>{t('settings.notifications.weeklyReport')}</span>
                </label>

                <div>
                  <Button type="submit" variant="primary">
                    {t('settings.notifications.saveBtn')}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;