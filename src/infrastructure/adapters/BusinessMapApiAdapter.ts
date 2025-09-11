import axios from 'axios';
import { Card } from '../../domain/entities/Card';

export interface BusinessMapApiResponse {
  data: {
    data: Array<{
      card_id: number;
      title: string;
      description?: string;
      type_id: number;
      linked_cards?: Array<{
        card_id: number;
        link_type: 'child' | 'parent';
      }>;
    }>;
  };
}

export class BusinessMapApiAdapter {
  private readonly baseUrl = 'middleware.bi.businessmap.dem.intranet.bb.com.br';

  async fetchCards(): Promise<Card[]> {
    const maxRetries = 15;
    const baseDelay = 1000; // 1 segundo
    
    console.log('[BusinessMapApiAdapter] Iniciando requisição para a API externa...');
    console.log(`[BusinessMapApiAdapter] URL: http://${this.baseUrl}/api/v2/cards`);
    console.log(`[BusinessMapApiAdapter] Máximo de tentativas: ${maxRetries}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[BusinessMapApiAdapter] Tentativa ${attempt}/${maxRetries}`);
        
        const response = await axios.get<BusinessMapApiResponse>(
          `http://${this.baseUrl}/api/v2/cards`
        );

        console.log(`[BusinessMapApiAdapter] Sucesso na tentativa ${attempt}! Status: ${response.status}`);
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
          description: card.description || undefined,
          type_id: card.type_id,
          linked_cards: card.linked_cards || []
        }));
        
        console.log(`[BusinessMapApiAdapter] Cards mapeados: ${mappedCards.length}`);
        console.log('[BusinessMapApiAdapter] Primeiros cards:', mappedCards.slice(0, 2));
        
        return mappedCards;
        
      } catch (error) {
        console.error(`[BusinessMapApiAdapter] Erro na tentativa ${attempt}:`, error);
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorData = error.response?.data;
          
          console.error('[BusinessMapApiAdapter] Detalhes do erro HTTP:');
          console.error('- Status:', status);
          console.error('- Status Text:', error.response?.statusText);
          console.error('- Data:', errorData);
          
          // Se é erro 429 (Too Many Requests), tenta novamente
          if (status === 429) {
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(1.5, attempt - 1); // Backoff exponencial
              console.log(`[BusinessMapApiAdapter] Rate limit atingido. Aguardando ${delay}ms antes da próxima tentativa...`);
              await this.sleep(delay);
              continue;
            } else {
              console.error('[BusinessMapApiAdapter] Número máximo de tentativas atingido devido ao rate limit');
              throw new Error('A API externa está temporariamente indisponível devido ao limite de requisições. Tente novamente em alguns minutos.');
            }
          }
          
          // Para outros erros HTTP, não tenta novamente
          throw new Error(`Erro HTTP ${status}: ${error.response?.statusText || 'Erro desconhecido'}`);
        }
        
        // Para erros de rede ou outros, tenta novamente apenas se não for a última tentativa
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          console.log(`[BusinessMapApiAdapter] Erro de rede. Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.sleep(delay);
          continue;
        }
        
        throw new Error(`Erro ao buscar cards da API após ${maxRetries} tentativas: ${error instanceof Error ? error.message : error}`);
      }
    }
    
    throw new Error(`Erro inesperado: todas as ${maxRetries} tentativas foram esgotadas`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}