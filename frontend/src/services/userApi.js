import api from './api';

export const userApi = {
  list: async (params = {}) => (await api.get('/users', { params })).data,
  update: async (id, updates) => (await api.patch(`/users/${id}`, updates)).data,
  invite: async (invitation) => (await api.post('/users/invitations', invitation)).data,
  invitations: async () => (await api.get('/users/invitations')).data,
  teams: async () => (await api.get('/teams')).data,
};