import api from './api';

export const userApi = {
  list: async (params = {}) => (await api.get('/users', { params })).data,
  update: async (id, updates) => (await api.patch(`/users/${id}`, updates)).data,
  teams: async () => (await api.get('/teams')).data,
  createTeam: async (team) => (await api.post('/teams', team)).data,
  assignableAgents: async () => (await api.get('/users/assignable-agents')).data,
};
