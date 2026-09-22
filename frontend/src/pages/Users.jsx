import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import './Users.css';

const MOCK_USERS = [
  { id: 1, name: 'Alex Rivera', email: 'alex@supportly.io', role: 'admin', status: 'active', openTickets: 4 },
  { id: 2, name: 'Emily Wong', email: 'emily@supportly.io', role: 'agent', status: 'active', openTickets: 6 },
  { id: 3, name: 'Michael Scott', email: 'michael@supportly.io', role: 'manager', status: 'offline', openTickets: 1 },
  { id: 4, name: 'Jessica Taylor', email: 'jessica@supportly.io', role: 'agent', status: 'invited', openTickets: 0 },
];

const Users = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newUser = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      openTickets: 0,
    };

    setUsers([...users, newUser]);
    setInviteSuccess(true);

    setTimeout(() => {
      setInviteSuccess(false);
      setIsModalOpen(false);
      setInviteEmail('');
      setInviteRole('agent');
    }, 1200);
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('users.title')}</h1>
          <p className="page-subtitle">{t('users.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          ✉️ {t('users.inviteBtn')}
        </Button>
      </div>

      <Card className="users-filter-card">
        <Input
          placeholder={t('users.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card>
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('users.table.user')}</th>
                <th>{t('users.table.role')}</th>
                <th>{t('users.table.status')}</th>
                <th>{t('users.table.ticketsAssigned')}</th>
                <th>{t('users.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell-info">
                      <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {t(`users.roles.${user.role}`)}
                    </span>
                  </td>
                  <td>
                    <Badge variant={`status-${user.status === 'active' ? 'resolved' : 'closed'}`}>
                      {t(`users.status.${user.status}`)}
                    </Badge>
                  </td>
                  <td>
                    <strong>{user.openTickets}</strong>
                  </td>
                  <td>
                    <Button variant="outline" className="btn-sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('inviteModal.title')}
      >
        {inviteSuccess ? (
          <div className="success-banner">✅ {t('inviteModal.successMsg')}</div>
        ) : (
          <form onSubmit={handleSendInvite} className="modal-form">
            <p className="modal-subtitle">{t('inviteModal.subtitle')}</p>
            <Input
              label={t('inviteModal.emailLabel')}
              type="email"
              placeholder={t('inviteModal.emailPlaceholder')}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <div className="form-group">
              <label className="form-label">{t('inviteModal.roleLabel')}</label>
              <select
                className="form-select"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="admin">{t('users.roles.admin')}</option>
                <option value="agent">{t('users.roles.agent')}</option>
                <option value="manager">{t('users.roles.manager')}</option>
              </select>
            </div>
            <div className="modal-actions">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('inviteModal.cancelBtn')}
              </Button>
              <Button type="submit" variant="primary">
                {t('inviteModal.sendBtn')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Users;