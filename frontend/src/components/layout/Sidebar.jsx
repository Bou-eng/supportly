import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const Sidebar = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/overview', label: t('nav.overview'), icon: '📊' },
    { path: '/tickets', label: t('nav.myTickets'), icon: '🎫' },
    { path: '/tickets/new', label: t('nav.createTicket'), icon: '➕' },
    { path: '/knowledge-base', label: t('nav.knowledgeBase'), icon: '📚' },
    { path: '/team-queue', label: t('nav.teamQueue'), icon: '👥' },
    { path: '/users', label: t('nav.users'), icon: '👤' },
    { path: '/reports', label: t('nav.reports'), icon: '📈' },
    { path: '/settings', label: t('nav.settings'), icon: '⚙️' },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">💬</span>
        <span className="brand-title">Supportly</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/tickets'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Promotional Card Block */}
      <div className="sidebar-promo-card">
        <h4>{t('promo.title')}</h4>
        <p>{t('promo.text')}</p>
        <button className="promo-btn">{t('promo.button')}</button>
      </div>
    </aside>
  );
};

export default Sidebar;