import api from './api';

export const categoryApi = {
  list: async () => (await api.get('/categories')).data,
};