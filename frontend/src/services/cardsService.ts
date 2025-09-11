import axios from 'axios';
import { ApiResponse } from '../types/Card';

const API_BASE_URL = '/api/cards';

export const cardsService = {
  async getInitiatives(): Promise<ApiResponse> {
    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/initiatives`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar iniciativas: ${error}`);
    }
  }
};