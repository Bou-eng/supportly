import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LanguageToggle from '../components/common/LanguageToggle';
import './AuthPages.css';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header-controls">
        <Button variant="outline" onClick={toggleTheme}>
          {theme === 'light' ? t('common.dark') : t('common.light')}
        </Button>
        <LanguageToggle />
      </div>

      <div className="auth-container">
        <div className="auth-left-panel">
          <div className="brand-logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">{t('common.appName')}</span>
          </div>

          <div className="showcase-content">
            <h1>{t('auth.recoveryTitle')}</h1>
            <p>{t('auth.recoveryDescription')}</p>
          </div>

          <div className="showcase-badges">
            <div className="badge-item">🔒 {t('auth.recoveryBadgeOne')}</div>
            <div className="badge-item">⏱️ {t('auth.recoveryBadgeTwo')}</div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-card">
            <h2>{t('auth.forgotPassword')}</h2>
            <p className="auth-subtitle">{t('auth.recoverySubtitle')}</p>

            {submitted ? (
              <div style={{ textTransform: 'none' }}>
                <p style={{ color: 'var(--status-resolved-text)', marginBottom: '1.5rem', fontWeight: '500' }}>
                  <Trans
                    i18nKey="auth.resetLinkSent"
                    values={{ email }}
                    components={{ email: <strong /> }}
                  />
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    {t('auth.backTo')} {t('auth.signIn')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Input
                  label={t('auth.emailLabel')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />

                <Button type="submit" variant="primary" className="w-full">
                  {t('auth.sendResetLink')} →
                </Button>
              </form>
            )}

            <div className="auth-footer-text">
              {t('auth.rememberedPassword')}{' '}
              <Link to="/login">{t('auth.signIn')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;