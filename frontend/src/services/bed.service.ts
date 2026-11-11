import { api } from './api';
import type { Bed } from '../types';

export const bedService = {
  getAll: async (): Promise<Bed[]> => {
    const response = await api.get('/beds');
    return response.data;
  },
  create: async (data: Omit<Bed, 'id'>): Promise<Bed> => {
    const response = await api.post('/beds', data);
    return response.data;
  },
  updateStatus: async (id: string, status: Bed['status'], patientId?: string): Promise<Bed> => {
    const response = await api.patch(`/beds/${id}/status`, { status, patientId });
    return response.data;
  }
};

