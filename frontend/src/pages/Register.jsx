import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LanguageToggle from '../components/common/LanguageToggle';
import './AuthPages.css';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      if (register) {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const errorKey = {
        'Please provide all required fields': 'auth.requiredFields',
        'User already exists': 'auth.userAlreadyExists',
        'Invalid user data': 'auth.invalidUserData',
        'Too many login/registration attempts from this IP, please try again after 15 minutes': 'auth.tooManyAttempts',
      }[serverMessage];

      setError(errorKey || 'auth.registerError');
    } finally {
      setLoading(false);
    }
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
        {/* Left Side: Brand Showcase Panel */}
        <div className="auth-left-panel">
          <div className="brand-logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">{t('common.appName')}</span>
          </div>

          <div className="showcase-content">
            <h1>{t('auth.registerShowcaseTitleLineOne')} <br />{t('auth.registerShowcaseTitleLineTwo')}</h1>
            <p>{t('auth.registerShowcaseDescription')}</p>
          </div>

          <div className="showcase-badges">
            <div className="badge-item">⚡ {t('auth.registerBadgeOne')}</div>
            <div className="badge-item">🔒 {t('auth.registerBadgeTwo')}</div>
            <div className="badge-item">🌐 {t('auth.registerBadgeThree')}</div>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="auth-right-panel">
          <div className="auth-card">
            <h2>{t('auth.signUp')}</h2>
            <p className="auth-subtitle">{t('auth.registerSubtitle')}</p>

            {error && <div className="auth-error-banner">{t(error)}</div>}

            <form onSubmit={handleSubmit}>
              <Input
                label={t('auth.fullNameLabel')}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.fullNamePlaceholder')}
                required
              />

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

              <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                {t('auth.signUp')} →
              </Button>
            </form>

            <div className="auth-footer-text">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login">{t('auth.signIn')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;