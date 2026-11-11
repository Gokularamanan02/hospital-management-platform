import { api } from './api';
import type { DashboardAnalytics } from '../types';

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardAnalytics> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }
};

