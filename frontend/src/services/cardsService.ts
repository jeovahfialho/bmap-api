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
            // Arrays devem ser separados por vírgula (ex: board_ids=804,351,352)
            params.append(key, value.join(','));
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
    } catch (error: any) {
      console.error('[cardsService] Erro ao buscar iniciativas:', error);
      
      if (error?.response?.status === 500) {
        throw new Error('O servidor não conseguiu buscar as iniciativas. A API externa pode estar indisponível ou lenta. Tente novamente.');
      }
      if (error?.response?.status === 429) {
        throw new Error('Limite de requisições atingido na API externa. Aguarde alguns segundos e tente novamente.');
      }
      if (error?.code === 'ECONNABORTED') {
        throw new Error('A busca demorou demais e foi cancelada. Tente novamente ou selecione menos boards.');
      }
      
      throw new Error(`Erro ao buscar iniciativas: ${error?.message || error}`);
    }
  }
};