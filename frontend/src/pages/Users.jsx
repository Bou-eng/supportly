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

const emptyUserForm = { name: '', email: '', password: '', role: USER_ROLES.AGENT, team: '' };
const emptyTeamForm = { name: '', description: '' };

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
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState(emptyUserForm);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [newTeam, setNewTeam] = useState(emptyTeamForm);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
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

  const openCreateUser = () => {
    setError('');
    setSuccess('');
    setNewUser(emptyUserForm);
    setIsCreateUserOpen(true);
  };

  const createUser = async (event) => {
    event.preventDefault();
    await runUserActionOnce(async () => {
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        const payload = {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: isAdmin ? newUser.role : USER_ROLES.AGENT,
          ...(isAdmin && { team: newUser.team }),
        };
        const created = await userApi.create(payload);
        setUsers((current) => [created, ...current]);
        setNewUser(emptyUserForm);
        setIsCreateUserOpen(false);
        setSuccess(`${created.name} was created as ${created.role}.`);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to create user.');
      } finally {
        setSaving(false);
      }
    });
  };

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
        setNewTeam(emptyTeamForm);
        setIsTeamOpen(false);
        setSuccess('Team created successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to create team.');
      } finally {
        setSaving(false);
      }
    });
  };

  const updateTeam = async (event) => {
    event.preventDefault();
    await runUserActionOnce(async () => {
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        const updated = await userApi.updateTeam(editingTeam._id, {
          name: editingTeam.name,
          description: editingTeam.description || '',
        });
        setTeams((current) => current
          .map((team) => team._id === updated._id ? updated : team)
          .sort((left, right) => left.name.localeCompare(right.name)));
        setUsers((current) => current.map((user) => user.team?._id === updated._id
          ? { ...user, team: { ...user.team, name: updated.name } }
          : user));
        setEditingTeam(null);
        setSuccess('Team updated successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to update team.');
      } finally {
        setSaving(false);
      }
    });
  };

  const deleteTeam = async () => {
    await runUserActionOnce(async () => {
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        await userApi.deleteTeam(deletingTeam._id);
        setTeams((current) => current.filter((team) => team._id !== deletingTeam._id));
        setDeletingTeam(null);
        setSuccess('Team deleted successfully.');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to delete team.');
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
          <Button variant="outline" onClick={() => setIsInviteOpen(true)}>Invite user</Button>
          <Button variant="primary" onClick={openCreateUser}>+ Create user</Button>
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

      {isAdmin && <Card title="Teams">
        {teams.length === 0 ? <p className="empty-team-message">No teams have been created yet.</p> : <div className="team-summary-grid">{teams.map((team) => <div className="team-summary-item" key={team._id}>
          <div className="team-summary-content"><strong>{team.name}</strong><span>{team.description || 'No description'}</span></div>
          <div className="team-summary-actions">
            <Button variant="outline" className="btn-sm" onClick={() => { setError(''); setEditingTeam({ ...team }); }} aria-label={`Edit ${team.name}`}>Edit</Button>
            <Button variant="danger" className="btn-sm" onClick={() => { setError(''); setDeletingTeam(team); }} aria-label={`Delete ${team.name}`}>Delete</Button>
          </div>
        </div>)}</div>}
      </Card>}

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

      <Modal isOpen={isCreateUserOpen} onClose={() => setIsCreateUserOpen(false)} title={isAdmin ? 'Create user' : 'Create agent'}>
        <form onSubmit={createUser} className="modal-form">
          <p className="modal-subtitle">{isAdmin ? 'Create an agent or manager account and assign it to a support team.' : 'Create a new agent account for your team.'}</p>
          <Input label="Name" name="new-user-name" value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} required autoComplete="name" />
          <Input label="Email" name="new-user-email" type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} required autoComplete="email" />
          <Input label="Initial password" name="new-user-password" type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} required minLength={8} autoComplete="new-password" showPasswordToggle />
          <p className="password-requirements">At least 8 characters with uppercase, lowercase, and a number.</p>
          {isAdmin ? <>
            <div className="form-group"><label className="form-label" htmlFor="new-user-role">Role</label><select id="new-user-role" className="form-select" value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}><option value={USER_ROLES.AGENT}>Agent</option><option value={USER_ROLES.MANAGER}>Manager</option></select></div>
            <div className="form-group"><label className="form-label" htmlFor="new-user-team">Team</label><select id="new-user-team" className="form-select" value={newUser.team} onChange={(event) => setNewUser({ ...newUser, team: event.target.value })} required><option value="">Select team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></div>
          </> : <div className="manager-team-notice">The new agent will be assigned to your team automatically.</div>}
          <Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>{isAdmin ? 'Create user' : 'Create agent'}</Button>
        </form>
      </Modal>

      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite users">
        <div className="coming-soon-modal"><div className="coming-soon-icon" aria-hidden="true">✉️</div><span className="coming-soon-label">COMING SOON</span><h4>Invitations will be added later</h4><p>For now, admins can create agent and manager accounts directly, while managers can create agents for their own team.</p><Button variant="primary" onClick={() => setIsInviteOpen(false)}>Got it</Button></div>
      </Modal>

      <Modal isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} title="Create team">
        <form onSubmit={createTeam} className="modal-form"><p className="modal-subtitle">Only administrators can create support teams.</p><Input label="Team name" value={newTeam.name} onChange={(event) => setNewTeam({ ...newTeam, name: event.target.value })} required /><Input label="Description" value={newTeam.description} onChange={(event) => setNewTeam({ ...newTeam, description: event.target.value })} /><Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>Create team</Button></form>
      </Modal>

      <Modal isOpen={Boolean(editingTeam)} onClose={() => setEditingTeam(null)} title="Edit team">
        {editingTeam && <form onSubmit={updateTeam} className="modal-form"><p className="modal-subtitle">Update the team name or description. Existing assignments will remain connected.</p><Input label="Team name" value={editingTeam.name} onChange={(event) => setEditingTeam({ ...editingTeam, name: event.target.value })} required /><Input label="Description" value={editingTeam.description || ''} onChange={(event) => setEditingTeam({ ...editingTeam, description: event.target.value })} /><Button type="submit" variant="primary" disabled={userActionLocked} isLoading={saving || userActionLocked}>Save team</Button></form>}
      </Modal>

      <Modal isOpen={Boolean(deletingTeam)} onClose={() => setDeletingTeam(null)} title="Delete team">
        {deletingTeam && <div className="delete-team-confirmation"><div className="delete-team-icon" aria-hidden="true">!</div><h4>Delete {deletingTeam.name}?</h4><p>This is only allowed when no users, tickets, or categories reference the team.</p>{error && <p className="delete-team-error" role="alert">{error}</p>}<div className="modal-actions"><Button variant="outline" onClick={() => setDeletingTeam(null)}>Cancel</Button><Button variant="danger" onClick={deleteTeam} disabled={userActionLocked} isLoading={saving || userActionLocked}>Delete team</Button></div></div>}
      </Modal>
    </div>
  );
};

export default Users;
