import api from './api';

export const userApi = {
  list: async (params = {}) => (await api.get('/users', { params })).data,
  create: async (user) => (await api.post('/users', user)).data,
  update: async (id, updates) => (await api.patch(`/users/${id}`, updates)).data,
  teams: async () => (await api.get('/teams')).data,
  createTeam: async (team) => (await api.post('/teams', team)).data,
  updateTeam: async (id, updates) => (await api.patch(`/teams/${id}`, updates)).data,
  deleteTeam: async (id) => (await api.delete(`/teams/${id}`)).data,
  assignableAgents: async () => (await api.get('/users/assignable-agents')).data,
};
