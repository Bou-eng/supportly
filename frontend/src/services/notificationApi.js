import api from './api';

export const notificationApi = {
  list: async () => (await api.get('/notifications')).data,
  markAsRead: async (id) => (await api.patch(`/notifications/${id}/read`)).data,
  markAllAsRead: async () => (await api.patch('/notifications/read-all')).data,
};