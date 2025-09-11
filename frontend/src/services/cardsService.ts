import axios from 'axios';
import { ApiResponse } from '../types/Card';

const API_BASE_URL = '/api/cards';

export const cardsService = {
  async getInitiatives(filters?: Record<string, any>): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/initiatives${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get<ApiResponse>(url);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar iniciativas: ${error}`);
    }
  }
};