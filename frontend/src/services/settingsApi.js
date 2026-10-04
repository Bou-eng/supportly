import api from './api';

export const settingsApi = {
  get: async () => (await api.get('/settings')).data,
  update: async (settings) => (await api.patch('/settings', settings)).data,
};