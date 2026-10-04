import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants/apiConstants';
import Modal from '../common/Modal';

const Sidebar = () => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  const navItems = [
    { path: '/overview', label: t('nav.overview'), icon: '📊' },
    { path: '/tickets', label: t('nav.myTickets'), icon: '🎫' },
    { path: '/tickets/new', label: t('nav.createTicket'), icon: '➕' },
    { path: '/knowledge-base', label: t('nav.knowledgeBase'), icon: '📚' },
    ...([USER_ROLES.AGENT, USER_ROLES.MANAGER, USER_ROLES.ADMIN].includes(role) ? [{ path: '/team-queue', label: t('nav.teamQueue'), icon: '👥' }] : []),
    ...([USER_ROLES.MANAGER, USER_ROLES.ADMIN].includes(role) ? [
      { path: '/users', label: t('nav.users'), icon: '👤' },
      { path: '/reports', label: t('nav.reports'), icon: '📈' },
    ] : []),
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
        <button className="promo-btn" onClick={() => setIsPromoOpen(true)}>{t('promo.button')}</button>
      </div>

      <Modal isOpen={isPromoOpen} onClose={() => setIsPromoOpen(false)} title={t('promo.modalTitle')}>
        <div className="promo-modal-content">
          <div className="promo-modal-icon">💬</div>
          <p className="promo-modal-lead">{t('promo.modalLead')}</p>
          <div className="promo-modal-grid">
            <div><strong>⚡</strong><span>{t('promo.featureFast')}</span></div>
            <div><strong>🔔</strong><span>{t('promo.featureVisibility')}</span></div>
            <div><strong>📊</strong><span>{t('promo.featureInsights')}</span></div>
          </div>
          <button className="promo-modal-action" onClick={() => setIsPromoOpen(false)}>{t('promo.close')}</button>
        </div>
      </Modal>
    </aside>
  );
};

export default Sidebar;