import api from './api';

export const ticketApi = {
  list: async (params = {}) => (await api.get('/tickets', { params })).data,
  get: async (identifier) => (await api.get(`/tickets/${identifier}`)).data,
  create: async (ticket) => (await api.post('/tickets', ticket)).data,
  update: async (identifier, updates) => (await api.patch(`/tickets/${identifier}`, updates)).data,
  updateStatus: async (identifier, status) => (await api.patch(`/tickets/${identifier}/status`, { status })).data,
  updatePriority: async (identifier, priority) => (await api.patch(`/tickets/${identifier}/priority`, { priority })).data,
  assign: async (identifier, assignedTo) => (await api.patch(`/tickets/${identifier}/assign`, { assignedTo })).data,
  messages: async (identifier) => (await api.get(`/tickets/${identifier}/messages`)).data,
  activity: async (identifier) => (await api.get(`/tickets/${identifier}/activity`)).data,
    reply: async (identifier, content, type = 'public', files = []) => {
    const formData = new FormData();
    formData.append('content', content || '');
    formData.append('type', type);
    files.forEach((file) => formData.append('attachments', file));
    return (await api.post(`/tickets/${identifier}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  attachmentUrl: async (identifier, messageId, attachmentId) => (await api.get(`/tickets/${identifier}/messages/${messageId}/attachments/${attachmentId}/download`)).data,
};