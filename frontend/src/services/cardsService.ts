import axios from 'axios';
import { ApiResponse } from '../types/Card';

const API_BASE_URL = '/api/cards';

export const cardsService = {
  async getInitiatives(filters?: Record<string, any>): Promise<ApiResponse> {
    console.log('[cardsService] Iniciando busca de iniciativas com filtros:', filters);
    
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
      console.log(`[cardsService] ${response.data.data?.length || 0} iniciativas obtidas`);
      
      return response.data;
    } catch (error) {
      console.error('[cardsService] Erro ao buscar iniciativas:', error);
      throw new Error(`Erro ao buscar iniciativas: ${error}`);
    }
  }
};