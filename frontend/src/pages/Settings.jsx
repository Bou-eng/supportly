import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../constants/apiConstants';
import { settingsApi } from '../services/settingsApi';
import { useActionLock } from '../hooks/useActionLock';
import './Settings.css';

const DEFAULT_SETTINGS = {
  profile: { name: '', email: '', language: 'en' },
  workspace: { name: '', domain: '' },
  notifications: { ticketAssigned: true, ticketUpdated: true, weeklyReport: false },
};

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { role, updateUser } = useAuth();
  const isAdmin = role === USER_ROLES.ADMIN;
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { locked, runOnce } = useActionLock();

  useEffect(() => {
    settingsApi.get()
      .then((data) => setSettings({ ...DEFAULT_SETTINGS, ...data, notifications: { ...DEFAULT_SETTINGS.notifications, ...data.notifications } }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const updateSection = (section, field, value) => {
    setSettings((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    await runOnce(async () => {
      setSaving(true);
      setSaved(false);
      setError('');
      try {
        const payload = { [activeTab]: settings[activeTab] };
        const updated = await settingsApi.update(payload);
        setSettings((current) => ({ ...current, ...updated }));
        if (activeTab === 'profile' && settings.profile.language !== i18n.resolvedLanguage?.split('-')[0]) {
          await i18n.changeLanguage(settings.profile.language);
        }
        if (activeTab === 'profile') updateUser({ ...JSON.parse(localStorage.getItem('user') || '{}'), name: updated.profile.name, email: updated.profile.email });
        setSaved(true);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to save settings.');
      } finally {
        setSaving(false);
      }
    });
  };

  if (loading) return <div className="settings-page"><Card>Loading settings...</Card></div>;

  return (
    <div className="settings-page">
      <div className="page-header"><div><h1 className="page-title">{t('settings.title')}</h1><p className="page-subtitle">{t('settings.subtitle')}</p></div></div>
      <div className="settings-container">
        <div className="settings-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 {t('settings.tabs.profile')}</button>
          {isAdmin && <button className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`} onClick={() => setActiveTab('workspace')}>🏢 {t('settings.tabs.workspace')}</button>}
          <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>🔔 {t('settings.tabs.notifications')}</button>
        </div>
        <div className="settings-content">
          {error && <div className="auth-error-banner">{error}</div>}
          {saved && <div className="success-banner">✅ {t('settings.successMsg')}</div>}
          {activeTab === 'profile' && <Card><h2 className="section-title">{t('settings.profile.title')}</h2><form onSubmit={handleSave} className="settings-form"><Input label={t('settings.profile.fullName')} value={settings.profile.name} onChange={(e) => updateSection('profile', 'name', e.target.value)} required /><Input label={t('settings.profile.email')} type="email" value={settings.profile.email} onChange={(e) => updateSection('profile', 'email', e.target.value)} required /><div className="form-group"><label className="form-label">{t('settings.profile.language')}</label><select className="form-select" value={settings.profile.language} onChange={(e) => updateSection('profile', 'language', e.target.value)}><option value="en">English</option><option value="tr">Türkçe</option></select></div><Button type="submit" variant="primary" disabled={locked} isLoading={saving || locked}>{t('settings.profile.saveBtn')}</Button></form></Card>}
          {activeTab === 'workspace' && isAdmin && <Card><h2 className="section-title">{t('settings.workspace.title')}</h2><form onSubmit={handleSave} className="settings-form"><Input label={t('settings.workspace.name')} value={settings.workspace.name} onChange={(e) => updateSection('workspace', 'name', e.target.value)} required /><Input label={t('settings.workspace.domain')} value={settings.workspace.domain} onChange={(e) => updateSection('workspace', 'domain', e.target.value)} required /><Button type="submit" variant="primary" disabled={locked} isLoading={saving || locked}>{t('settings.workspace.saveBtn')}</Button></form></Card>}
          {activeTab === 'notifications' && <Card><h2 className="section-title">{t('settings.notifications.title')}</h2><form onSubmit={handleSave} className="settings-form">{['ticketAssigned', 'ticketUpdated', 'weeklyReport'].map((key) => <label className="checkbox-label" key={key}><input type="checkbox" checked={settings.notifications[key]} onChange={(e) => updateSection('notifications', key, e.target.checked)} /><span>{t(`settings.notifications.${key}`)}</span></label>)}<Button type="submit" variant="primary" disabled={locked} isLoading={saving || locked}>{t('settings.notifications.saveBtn')}</Button></form></Card>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
