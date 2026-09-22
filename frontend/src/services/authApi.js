import api from './api';

// Auth API service methods mapping directly to backend routes (/api/auth)
export const authApi = {
  // POST /api/auth/register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // GET /api/auth/me
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};