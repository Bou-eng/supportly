import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import LanguageToggle from '../common/LanguageToggle';
import Button from '../common/Button';
import './Header.css';

const Header = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      {/* Search Input */}
      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          className="search-input"
        />
      </div>

      {/* Right Action Menu */}
      <div className="header-actions">
        <Button variant="outline" onClick={toggleTheme} className="icon-btn">
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>

        <LanguageToggle />

        <button className="notification-btn" title={t('header.notifications')}>
          🔔 <span className="notification-badge"></span>
        </button>

        {/* User Profile Info */}
        <div className="user-profile">
          <div className="avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'John Doe'}</span>
            <span className="user-role">{user?.role || 'Admin'}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign Out">
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;