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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { locked: userActionLocked, runOnce: runUserActionOnce } = useActionLock();

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, teamData] = await Promise.all([userApi.list(), userApi.teams()]);
      setUsers(userData);
      setTeams(teamData);
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
      setError('');
      setSuccess('');
      try {
        const payload = isAdmin
          ? { role: editingUser.role, team: editingUser.team?._id || editingUser.team || null, status: editingUser.status }
          : { role: USER_ROLES.AGENT, status: editingUser.status };
        const updated = await userApi.update(editingUser._id, payload);
        setUsers((current) => current.map((user) => user._id === updated._id ? updated : user));
        setEditingUser(null);
        setSuccess(isAdmin ? 'User access updated successfully.' : 'Agent added to your team successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to update user.');
      } finally {
        setSaving(false);
      }
    });
  };

  const createTeam = async (event) => {
    event.preventDefault();
    await runUserActionOnce(async () => {
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        const created = await userApi.createTeam(newTeam);
        setTeams((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));
        setNewTeam({ name: '', description: '' });
        setIsTeamOpen(false);
        setSuccess('Team created successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to create team.');
      } finally {
        setSaving(false);
      }
    });
  };

  const visibleUsers = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const roleNeedsTeam = [USER_ROLES.AGENT, USER_ROLES.MANAGER].includes(editingUser?.role);

  return (
    <div className="users-page">
      <div className="page-header">
        <div><h1 className="page-title">{t('users.title')}</h1><p className="page-subtitle">{t('users.subtitle')}</p></div>
        <div className="users-header-actions">
          {isAdmin && <Button variant="outline" onClick={() => setIsTeamOpen(true)}>+ Create team</Button>}
          <Button variant="primary" onClick={() => setIsInviteOpen(true)}>Invite user</Button>
        </div>
      </div>
      {error && <Card className="no-results-card"><p>{error}</p></Card>}
      {success && <Card className="success-banner"><p>{success}</p></Card>}
      <Card className="users-filter-card"><Input placeholder={t('users.searchPlaceholder')} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></Card>
      <Card>
        {loading ? <p>Loading users...</p> : visibleUsers.length === 0 ? <p>No users found.</p> : <div className="table-responsive">
          <table className="users-table"><thead><tr><th>User</th><th>Role</th><th>Team</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {visibleUsers.map((user) => <tr key={user._id}><td><div className="user-cell-info"><div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div><div><div className="user-name">{user.name}</div><div className="user-email">{user.email}</div></div></div></td><td><span className={`role-badge role-${user.role}`}>{user.role}</span></td><td>{user.team?.name || 'Unassigned'}</td><td><Badge variant={`status-${user.status === 'active' ? 'resolved' : 'closed'}`}>{user.status}</Badge></td><td>{user.role === USER_ROLES.ADMIN ? <span className="protected-account-label">Protected</span> : <Button variant="outline" className="btn-sm" onClick={() => setEditingUser({ ...user, originalRole: user.role, role: isAdmin ? user.role : USER_ROLES.AGENT })}>{user.role === USER_ROLES.CUSTOMER ? 'Promote' : 'Manage'}</Button>}</td></tr>)}
          </tbody></table>
        </div>}
      </Card>

      {isAdmin && <Card title="Teams"><div className="team-summary-grid">{teams.map((team) => <div className="team-summary-item" key={team._id}><strong>{team.name}</strong><span>{team.description || 'No description'}</span></div>)}</div></Card>}

      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title={editingUser?.originalRole === USER_ROLES.CUSTOMER ? 'Promote user' : 'Manage user'}>
        {editingUser && <form onSubmit={updateUser} className="modal-form">
          <p className="modal-subtitle">{isAdmin ? 'Assign an operational role and team to this registered user.' : 'Managers can promote customers to agents in their own team.'}</p>
          <div className="form-group"><label className="form-label" htmlFor="user-role">Role</label><select id="user-role" className="form-select" value={editingUser.role} onChange={(event) => setEditingUser({ ...editingUser, role: event.target.value, team: event.target.value === USER_ROLES.CUSTOMER ? '' : editingUser.team })} disabled={!isAdmin}><option value={USER_ROLES.CUSTOMER}>Customer</option><option value={USER_ROLES.AGENT}>Agent</option>{isAdmin && <option value={USER_ROLES.MANAGER}>Manager</option>}</select></div>
          {isAdmin && roleNeedsTeam && <div className="form-group"><label className="form-label" htmlFor="user-team">Team</label><select id="user-team" className="form-select" value={editingUser.team?._id || editingUser.team || ''} onChange={(event) => setEditingUser({ ...editingUser, team: event.target.value })} required><option value="">Select team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></div>}
          {!isAdmin && <div className="manager-team-notice">The user will be added to your team automatically.</div>}
          <div className="form-group"><label className="form-label" htmlFor="user-status">Status</label><select id="user-status" className="form-select" value={editingUser.status} onChange={(event) => setEditingUser({ ...editingUser, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>Save changes</Button>
        </form>}
      </Modal>

      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite users">
        <div className="coming-soon-modal"><div className="coming-soon-icon" aria-hidden="true">✉️</div><span className="coming-soon-label">COMING SOON</span><h4>Invitations will be added later</h4><p>For now, users can create their own customer account. An admin can then promote them to agent or manager, and a manager can promote them to an agent in their team.</p><Button variant="primary" onClick={() => setIsInviteOpen(false)}>Got it</Button></div>
      </Modal>

      <Modal isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} title="Create team">
        <form onSubmit={createTeam} className="modal-form"><p className="modal-subtitle">Only administrators can create support teams.</p><Input label="Team name" value={newTeam.name} onChange={(event) => setNewTeam({ ...newTeam, name: event.target.value })} required /><Input label="Description" value={newTeam.description} onChange={(event) => setNewTeam({ ...newTeam, description: event.target.value })} /><Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>Create team</Button></form>
      </Modal>
    </div>
  );
};

export default Users;
