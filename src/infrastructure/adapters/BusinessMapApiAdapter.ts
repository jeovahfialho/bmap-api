import axios from 'axios';
import { Card } from '../../domain/entities/Card';

export interface BusinessMapApiResponse {
  data: {
    data: Array<{
      card_id: number;
      title: string;
      description: string;
      type_id: number;
      linked_cards: Array<{
        card_id: number;
        link_type: 'child' | 'parent';
      }>;
    }>;
  };
}

export class BusinessMapApiAdapter {
  private readonly baseUrl = 'middleware.bi.businessmap.dem.intranet.bb.com.br';

  async fetchCards(): Promise<Card[]> {
    console.log('[BusinessMapApiAdapter] Iniciando requisição para a API externa...');
    console.log(`[BusinessMapApiAdapter] URL: https://${this.baseUrl}/api/v2/cards`);
    
    try {
      const response = await axios.get<BusinessMapApiResponse>(
        `https://${this.baseUrl}/api/v2/cards`
      );

      console.log(`[BusinessMapApiAdapter] Resposta recebida - Status: ${response.status}`);
      console.log(`[BusinessMapApiAdapter] Estrutura da resposta:`, Object.keys(response.data));
      
      if (!response.data?.data?.data) {
        console.error('[BusinessMapApiAdapter] Estrutura de resposta inesperada:', response.data);
        throw new Error('Estrutura de resposta da API não conforme esperado');
      }

      const rawCards = response.data.data.data;
      console.log(`[BusinessMapApiAdapter] Cards raw recebidos: ${rawCards.length}`);
      
      const mappedCards = rawCards.map(card => ({
        card_id: card.card_id,
        title: card.title,
        description: card.description,
        type_id: card.type_id,
        linked_cards: card.linked_cards
      }));
      
      console.log(`[BusinessMapApiAdapter] Cards mapeados: ${mappedCards.length}`);
      console.log('[BusinessMapApiAdapter] Primeiros cards:', mappedCards.slice(0, 2));
      
      return mappedCards;
    } catch (error) {
      console.error('[BusinessMapApiAdapter] Erro detalhado ao buscar cards:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('[BusinessMapApiAdapter] Detalhes do erro HTTP:');
        console.error('- Status:', error.response?.status);
        console.error('- Status Text:', error.response?.statusText);
        console.error('- Headers:', error.response?.headers);
        console.error('- Data:', error.response?.data);
        console.error('- URL:', error.config?.url);
        console.error('- Method:', error.config?.method);
      }
      
      throw new Error(`Erro ao buscar cards da API: ${error instanceof Error ? error.message : error}`);
    }
  }
}