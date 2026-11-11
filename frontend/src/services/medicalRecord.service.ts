import { api } from './api';
import type { MedicalRecord } from '../types';

export const medicalRecordService = {
  getAll: async (): Promise<MedicalRecord[]> => {
    const response = await api.get('/medical-records');
    return response.data;
  },
  getByPatient: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  },
  create: async (data: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
    const response = await api.post('/medical-records', data);
    return response.data;
  }
};

