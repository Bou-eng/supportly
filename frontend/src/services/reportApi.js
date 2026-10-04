import api from './api';

export const reportApi = {
  summary: async (params = {}) => (await api.get('/reports/summary', { params })).data,
  agentPerformance: async (params = {}) => (await api.get('/reports/agent-performance', { params })).data,
  teamWorkload: async (params = {}) => (await api.get('/reports/team-workload', { params })).data,
  ticketVolume: async (params = {}) => (await api.get('/reports/ticket-volume', { params })).data,
};