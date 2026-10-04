import api from './api';

export const knowledgeApi = {
  list: async (params = {}) => {
    const data = (await api.get('/articles', { params })).data;
    return Array.isArray(data)
      ? { articles: data, page: 1, pages: 1, total: data.length }
      : data;
  },
  create: async (article) => (await api.post('/articles', article)).data,
  update: async (id, article) => (await api.patch(`/articles/${encodeURIComponent(id)}`, article)).data,
  publish: async (id, published) => (await api.patch(`/articles/${encodeURIComponent(id)}/publish`, { published })).data,
  remove: async (id) => (await api.delete(`/articles/${encodeURIComponent(id)}`)).data,
  categories: async () => (await api.get('/categories')).data,
};