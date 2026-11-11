import { api } from './api';
import type { AIResponse } from '../types';

export const aiService = {
  query: async (prompt: string): Promise<AIResponse> => {
    const response = await api.post('/ai/query', { prompt });
    return response.data;
  }
};

