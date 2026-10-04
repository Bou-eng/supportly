import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../constants/apiConstants';
import { userApi } from '../services/userApi';
import { useActionLock } from '../hooks/useActionLock';
import './Users.css';

const Users = () => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const isAdmin = role === USER_ROLES.ADMIN;
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: '', role: USER_ROLES.AGENT, team: '' });
  const [saving, setSaving] = useState(false);
  const { locked: userActionLocked, runOnce: runUserActionOnce } = useActionLock();

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, teamData, invitationData] = await Promise.all([userApi.list(), userApi.teams(), userApi.invitations()]);
      setUsers(userData);
      setTeams(teamData);
      setInvitations(invitationData);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateUser = async (event) => {
    event.preventDefault();
    await runUserActionOnce(async () => {
      setSaving(true);
      try {
        const updated = await userApi.update(editingUser._id, { role: editingUser.role, team: editingUser.team?._id || editingUser.team || null, status: editingUser.status });
        setUsers((current) => current.map((user) => user._id === updated._id ? updated : user));
        setEditingUser(null);
        setSuccess('User updated successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to update user.');
      } finally { setSaving(false); }
    });
  };

  const sendInvitation = async (event) => {
    event.preventDefault();
    await runUserActionOnce(async () => {
      setSaving(true);
      try {
        const created = await userApi.invite(invite);
        setInvitations((current) => [created, ...current]);
        setIsInviteOpen(false);
        setInvite({ email: '', role: USER_ROLES.AGENT, team: '' });
        setSuccess('Invitation created successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to create invitation.');
      } finally { setSaving(false); }
    });
  };

  const visibleUsers = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="users-page">
      <div className="page-header">
        <div><h1 className="page-title">{t('users.title')}</h1><p className="page-subtitle">{t('users.subtitle')}</p></div>
        <Button variant="primary" onClick={() => setIsInviteOpen(true)}>Invite user</Button>
      </div>
      {error && <Card className="no-results-card"><p>{error}</p></Card>}
      {success && <Card className="success-banner"><p>{success}</p></Card>}
      <Card className="users-filter-card"><Input placeholder={t('users.searchPlaceholder')} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></Card>
      <Card>
        {loading ? <p>Loading users...</p> : visibleUsers.length === 0 ? <p>No users found.</p> : <div className="table-responsive">
          <table className="users-table"><thead><tr><th>User</th><th>Role</th><th>Team</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {visibleUsers.map((user) => <tr key={user._id}><td><div className="user-cell-info"><div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div><div><div className="user-name">{user.name}</div><div className="user-email">{user.email}</div></div></div></td><td><span className={`role-badge role-${user.role}`}>{user.role}</span></td><td>{user.team?.name || 'Unassigned'}</td><td><Badge variant={`status-${user.status === 'active' ? 'resolved' : 'closed'}`}>{user.status}</Badge></td><td><Button variant="outline" className="btn-sm" onClick={() => setEditingUser({ ...user })}>Edit</Button></td></tr>)}
          </tbody></table>
        </div>}
      </Card>
      <Card title="Pending invitations"><p>{invitations.length === 0 ? 'No pending invitations.' : invitations.map((item) => `${item.email} (${item.role})`).join(', ')}</p></Card>

      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Edit user">
        {editingUser && <form onSubmit={updateUser} className="modal-form"><div className="form-group"><label className="form-label">Role</label><select className="form-select" value={editingUser.role} onChange={(event) => setEditingUser({ ...editingUser, role: event.target.value })} disabled={!isAdmin}><option value={USER_ROLES.CUSTOMER}>Customer</option><option value={USER_ROLES.AGENT}>Agent</option><option value={USER_ROLES.MANAGER}>Manager</option><option value={USER_ROLES.ADMIN}>Admin</option></select></div><div className="form-group"><label className="form-label">Team</label><select className="form-select" value={editingUser.team?._id || editingUser.team || ''} onChange={(event) => setEditingUser({ ...editingUser, team: event.target.value })}><option value="">Unassigned</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></div><div className="form-group"><label className="form-label">Status</label><select className="form-select" value={editingUser.status} onChange={(event) => setEditingUser({ ...editingUser, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div><Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>Save changes</Button></form>}
      </Modal>
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite user"><form onSubmit={sendInvitation} className="modal-form"><Input label="Email" type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} required /><div className="form-group"><label className="form-label">Role</label><select className="form-select" value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })}><option value={USER_ROLES.AGENT}>Agent</option>{isAdmin && <option value={USER_ROLES.MANAGER}>Manager</option>}</select></div><div className="form-group"><label className="form-label">Team</label><select className="form-select" value={invite.team} onChange={(event) => setInvite({ ...invite, team: event.target.value })} required><option value="">Select team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></div><Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>Create invitation</Button></form></Modal>
    </div>
  );
};

export default Users;
