import { api } from './api';
import type { Department } from '../types';

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data;
  },
  create: async (data: Omit<Department, 'id'>): Promise<Department> => {
    const response = await api.post('/departments', data);
    return response.data;
  }
};

