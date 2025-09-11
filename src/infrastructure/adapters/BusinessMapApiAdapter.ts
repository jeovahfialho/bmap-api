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

export interface CardDetailResponse {
  data: {
    card_id: number;
    title: string;
    description: string;
    type_id: number;
    linked_cards: Array<{
      card_id: number;
      link_type: 'child' | 'parent';
    }>;
  };
}

export interface BoardsResponse {
  data: Array<{
    board_id: number;
    workspace_id: number;
    is_archived: number;
    name: string;
    description: string;
    type: number;
  }>;
}

export interface Board {
  board_id: number;
  name: string;
  description: string;
  is_archived: boolean;
}

export class BusinessMapApiAdapter {
  private readonly baseUrl = 'middleware.bi.businessmap.dem.intranet.bb.com.br';

  async fetchBoards(): Promise<Board[]> {
    const maxRetries = 5;
    const baseDelay = 500;
    
    console.log('[BusinessMapApiAdapter] Buscando boards disponíveis...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[BusinessMapApiAdapter] Tentativa ${attempt}/${maxRetries} para boards`);
        
        const response = await axios.get<any>(
          `http://${this.baseUrl}/api/v2/boards`
        );

        const boardsData = response.data.data || response.data;
        console.log(`[BusinessMapApiAdapter] Boards obtidos com sucesso! Total: ${boardsData.length}`);
        
        const boards = boardsData.map((board: any) => ({
          board_id: board.board_id,
          name: board.name,
          description: board.description,
          is_archived: board.is_archived === 1
        }));
        
        return boards;
        
      } catch (error) {
        console.error(`[BusinessMapApiAdapter] Erro na tentativa ${attempt} para boards:`, error);
        
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(1.5, attempt - 1);
            console.log(`[BusinessMapApiAdapter] Rate limit para boards. Aguardando ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }
        }
        
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          await this.sleep(delay);
          continue;
        }
        
        throw new Error(`Erro ao buscar boards: ${error instanceof Error ? error.message : error}`);
      }
    }
    
    throw new Error('Erro inesperado ao buscar boards');
  }

  async fetchCards(queryParams?: Record<string, any>): Promise<Card[]> {
    const maxRetries = 15;
    const baseDelay = 1000; // 1 segundo
    
    // Constrói a URL com parâmetros de query
    const urlParams = new URLSearchParams();
    
    // Adiciona parâmetros padrões se não especificados
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => urlParams.append(key, v.toString()));
        } else if (value !== undefined && value !== null) {
          urlParams.append(key, value.toString());
        }
      });
    }
    
    // Parâmetros padrão para otimizar a busca
    if (!queryParams?.type_ids) {
      urlParams.append('type_ids', '1'); // Histórias
      urlParams.append('type_ids', '2'); // Iniciativas
    }
    
    if (!queryParams?.per_page) {
      urlParams.append('per_page', '1000'); // Máximo permitido
    }
    
    if (!queryParams?.expand) {
      urlParams.append('expand', 'linked_cards');
    }
    
    const queryString = urlParams.toString();
    const fullUrl = `http://${this.baseUrl}/api/v2/cards${queryString ? `?${queryString}` : ''}`;
    
    console.log('[BusinessMapApiAdapter] Iniciando requisição para a API externa...');
    console.log(`[BusinessMapApiAdapter] URL: ${fullUrl}`);
    console.log(`[BusinessMapApiAdapter] Máximo de tentativas: ${maxRetries}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get<BusinessMapApiResponse>(fullUrl);

        console.log(`[BusinessMapApiAdapter] Sucesso! ${response.data.data.data.length} cards obtidos`);
        
        if (!response.data?.data?.data) {
          console.error('[BusinessMapApiAdapter] Estrutura de resposta inesperada:', response.data);
          throw new Error('Estrutura de resposta da API não conforme esperado');
        }

        const rawCards = response.data.data.data;
        
        const mappedCards = rawCards.map(card => ({
          card_id: card.card_id,
          title: card.title,
          description: card.description || undefined,
          type_id: card.type_id,
          linked_cards: card.linked_cards || []
        }));
        
        return mappedCards;
        
      } catch (error) {
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          
          // Se é erro 429 (Too Many Requests), tenta novamente
          if (status === 429) {
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(1.5, attempt - 1);
              console.log(`[BusinessMapApiAdapter] Rate limit - aguardando ${delay}ms...`);
              await this.sleep(delay);
              continue;
            } else {
              console.error('[BusinessMapApiAdapter] Máximo de tentativas atingido');
              throw new Error('A API externa está temporariamente indisponível devido ao limite de requisições. Tente novamente em alguns minutos.');
            }
          }
          
          // Para outros erros HTTP, mostra detalhes
          console.error('[BusinessMapApiAdapter] Erro HTTP:', status, error.response?.statusText);
          
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

  async fetchCardDetails(cardId: number): Promise<Card> {
    const maxRetries = 5;
    const baseDelay = 500;
    
    console.log(`[BusinessMapApiAdapter] Buscando detalhes do card ${cardId}...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[BusinessMapApiAdapter] Tentativa ${attempt}/${maxRetries} para card ${cardId}`);
        
        const response = await axios.get<CardDetailResponse>(
          `http://${this.baseUrl}/api/v2/cards/${cardId}`
        );

        console.log(`[BusinessMapApiAdapter] Detalhes do card ${cardId} obtidos com sucesso!`);
        
        const card = response.data.data;
        return {
          card_id: card.card_id,
          title: card.title,
          description: card.description || undefined,
          type_id: card.type_id,
          linked_cards: card.linked_cards || []
        };
        
      } catch (error) {
        console.error(`[BusinessMapApiAdapter] Erro na tentativa ${attempt} para card ${cardId}:`, error);
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          
          if (status === 429) {
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(1.5, attempt - 1);
              console.log(`[BusinessMapApiAdapter] Rate limit para card ${cardId}. Aguardando ${delay}ms...`);
              await this.sleep(delay);
              continue;
            } else {
              console.error(`[BusinessMapApiAdapter] Rate limit esgotado para card ${cardId}`);
              throw new Error(`Rate limit atingido para card ${cardId}`);
            }
          }
          
          throw new Error(`Erro HTTP ${status} ao buscar detalhes do card ${cardId}`);
        }
        
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          console.log(`[BusinessMapApiAdapter] Erro de rede para card ${cardId}. Aguardando ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }
        
        throw new Error(`Erro ao buscar detalhes do card ${cardId}: ${error instanceof Error ? error.message : error}`);
      }
    }
    
    throw new Error(`Erro inesperado ao buscar detalhes do card ${cardId}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}