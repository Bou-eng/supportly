import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LanguageToggle from '../components/common/LanguageToggle';
import './AuthPages.css';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const errorKey = {
        'Please provide email and password': 'auth.emailPasswordRequired',
        'Invalid credentials': 'auth.invalidCredentials',
        'Too many login/registration attempts from this IP, please try again after 15 minutes': 'auth.tooManyAttempts',
      }[serverMessage];

      setError(errorKey || 'auth.signInError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Top Header Controls */}
      <div className="auth-header-controls">
        <Button variant="outline" onClick={toggleTheme}>
          {theme === 'light' ? t('common.dark') : t('common.light')}
        </Button>
        <LanguageToggle />
      </div>

      <div className="auth-container">
        {/* Left Side: Brand Showcase Panel */}
        <div className="auth-left-panel">
          <div className="brand-logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">{t('common.appName')}</span>
          </div>
          
          <div className="showcase-content">
            <h1>{t('auth.loginShowcaseTitleLineOne')} <br />{t('auth.loginShowcaseTitleLineTwo')}</h1>
            <p>{t('auth.loginShowcaseDescription')}</p>
          </div>

          <div className="showcase-badges">
            <div className="badge-item">⚡ {t('auth.loginBadgeOne')}</div>
            <div className="badge-item">👥 {t('auth.loginBadgeTwo')}</div>
            <div className="badge-item">📊 {t('auth.loginBadgeThree')}</div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="auth-right-panel">
          <div className="auth-card">
            <h2>{t('auth.welcomeBack')}</h2>
            <p className="auth-subtitle">{t('auth.signInSubtitle')}</p>

            {error && <div className="auth-error-banner">{t(error)}</div>}

            <form onSubmit={handleSubmit}>
              <Input
                label={t('auth.emailLabel')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                required
              />

              <Input
                label={t('auth.passwordLabel')}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                required
              />

              <div className="form-actions-row">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>{t('auth.rememberMe')}</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">{t('auth.forgotPassword')}</Link>
              </div>

              <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                {t('auth.signIn')} →
              </Button>
            </form>

            <div className="auth-footer-text">
              {t('auth.noAccount')}{' '}
              <Link to="/register">{t('auth.createOne')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;