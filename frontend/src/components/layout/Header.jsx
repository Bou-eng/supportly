import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import LanguageToggle from '../common/LanguageToggle';
import Button from '../common/Button';
import { useEffect, useState } from 'react';
import { notificationApi } from '../../services/notificationApi';
import { useActionLock } from '../../hooks/useActionLock';
import { useEffect as useSearchEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../../services/ticketApi';
import { knowledgeApi } from '../../services/knowledgeApi';
import './Header.css';

const Header = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ tickets: [], articles: [] });
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { locked: notificationLocked, runOnce: runNotificationOnce } = useActionLock();
  const { locked: logoutLocked, runOnce: runLogoutOnce } = useActionLock();

  const loadNotifications = async () => {
    try {
      const result = await notificationApi.list();
      setNotifications(result.notifications || []);
      setUnread(result.unread || 0);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => { loadNotifications(); }, [user]);

  useSearchEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({ tickets: [], articles: [] });
      return undefined;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [tickets, articles] = await Promise.all([ticketApi.list({ search: searchTerm, limit: 5 }), knowledgeApi.list({ search: searchTerm, limit: 5 })]);
        setSearchResults({ tickets: tickets.tickets || [], articles: articles.articles || [] });
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const markRead = async (notification) => {
    if (notification.isRead) return;
    await runNotificationOnce(async () => {
      await notificationApi.markAsRead(notification._id);
      setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, isRead: true } : item));
      setUnread((current) => Math.max(current - 1, 0));
    });
  };

  return (
    <header className="app-header">
      {/* Search Input */}
      <div className="header-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          className="search-input"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {searchTerm && <div className="header-search-results">{searching ? <p>Searching...</p> : <>{searchResults.tickets.map((ticket) => <button key={ticket._id} onClick={() => { navigate(`/tickets/${ticket.ticketNumber || ticket._id}`); setSearchTerm(''); }}><strong>{ticket.ticketNumber}</strong> {ticket.title}</button>)}{searchResults.articles.map((article) => <button key={article._id} onClick={() => { navigate(`/knowledge-base?search=${encodeURIComponent(article.title)}`); setSearchTerm(''); }}><strong>Article</strong> {article.title}</button>)}{!searchResults.tickets.length && !searchResults.articles.length && <p>No results found.</p>}</>}</div>}
      </div>

      {/* Right Action Menu */}
      <div className="header-actions">
        <Button variant="outline" onClick={toggleTheme} className="icon-btn">
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>

        <LanguageToggle />

        <button className="notification-btn" title={t('header.notifications')} onClick={() => setShowNotifications((current) => !current)}>
          🔔 {unread > 0 && <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>}
        </button>
        {showNotifications && <div className="notification-panel">
          <div className="notification-panel-header"><strong>Notifications</strong><button disabled={notificationLocked} onClick={() => runNotificationOnce(async () => { await notificationApi.markAllAsRead(); setUnread(0); setNotifications((current) => current.map((item) => ({ ...item, isRead: true }))); })}>Mark all read</button></div>
          {notifications.length === 0 ? <p className="notification-empty">No notifications</p> : notifications.slice(0, 8).map((notification) => <button key={notification._id} className={`notification-item ${notification.isRead ? '' : 'unread'}`} onClick={() => markRead(notification)}>{notification.message}<small>{new Date(notification.createdAt).toLocaleString()}</small></button>)}
        </div>}

        {/* User Profile Info */}
        <div className="user-profile">
          <div className="avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'John Doe'}</span>
            <span className="user-role">{user?.role || 'Admin'}</span>
          </div>
          <button className="logout-btn" disabled={logoutLocked} onClick={() => runLogoutOnce(logout)} title="Sign Out">
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;