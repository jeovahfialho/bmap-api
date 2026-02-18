import axios from 'axios';
import { Card, LoggedTimeEntry } from '../../domain/entities/Card';

export interface BusinessMapApiResponse {
  data: {
    pagination: {
      all_pages: number;
      current_page: number;
      results_per_page: number;
    };
    data: Array<{
      card_id: number;
      title: string;
      description?: string;
      type_id: number;
      board_id?: number;
      first_start_time?: string;
      owner_user_id?: number;
      linked_cards?: Array<{
        card_id: number;
        link_type: 'child' | 'parent';
      }>;
      logged_times?: LoggedTimeEntry[];
      co_owner_ids?: number[];
      current_logged_time?: number;
    }>;
  };
}

export interface UserResponse {
  user_id: number;
  username: string;
  realname: string;
  email?: string;
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
          `http://${this.baseUrl}/api/v2/boards`,
          { timeout: 15000 } // 15 segundos
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

  async fetchCards(queryParams?: Record<string, any>): Promise<{ cards: Card[], pagination: { all_pages: number, current_page: number, results_per_page: number } }> {
    const maxRetries = 15;
    const baseDelay = 1000; // 1 segundo
    
    // Constrói a query string manualmente (URLSearchParams codifica vírgulas como %2C)
    const parts: string[] = [];
    parts.push('type_ids=2');
    
    if (queryParams?.board_ids && Array.isArray(queryParams.board_ids)) {
      parts.push(`board_ids=${queryParams.board_ids.join(',')}`);
    }
    
    parts.push('fields=first_start_time,card_id,title,description,owner_user_id,type_id,board_id,current_logged_time');
    parts.push('expand=logged_times,co_owner_ids');
    
    const queryString = parts.join('&');
    const fullUrl = `http://${this.baseUrl}/api/v2/cards?${queryString}`;
    
    console.log('[BusinessMapApiAdapter] Iniciando requisição para a API externa...');
    console.log(`[BusinessMapApiAdapter] URL: ${fullUrl}`);
    console.log(`[BusinessMapApiAdapter] Máximo de tentativas: ${maxRetries}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get<BusinessMapApiResponse>(fullUrl, {
          timeout: 30000 // 30 segundos por tentativa
        });

        console.log(`[BusinessMapApiAdapter] Sucesso! ${response.data.data.data.length} cards obtidos`);
        console.log(`[BusinessMapApiAdapter] Paginação:`, response.data.data.pagination);
        
        if (!response.data?.data?.data) {
          console.error('[BusinessMapApiAdapter] Estrutura de resposta inesperada:', response.data);
          throw new Error('Estrutura de resposta da API não conforme esperado');
        }

        const rawCards = response.data.data.data;
        const pagination = response.data.data.pagination;
        
        const mappedCards = rawCards.map(card => ({
          card_id: card.card_id,
          title: card.title,
          description: card.description || undefined,
          type_id: card.type_id,
          board_id: card.board_id,
          first_start_time: card.first_start_time,
          owner_user_id: card.owner_user_id,
          linked_cards: card.linked_cards || [],
          logged_times: card.logged_times || [],
          co_owner_ids: card.co_owner_ids || [],
          current_logged_time: card.current_logged_time || 0
        }));
        
        return { cards: mappedCards, pagination };
        
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

  async fetchUsers(): Promise<UserResponse[]> {
    const maxRetries = 5;
    const baseDelay = 500;
    
    console.log('[BusinessMapApiAdapter] Buscando usuários...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[BusinessMapApiAdapter] Tentativa ${attempt}/${maxRetries} para usuários`);
        
        const response = await axios.get<any>(
          `http://${this.baseUrl}/api/v2/users`,
          { timeout: 15000 }
        );

        const usersData = response.data.data || response.data;
        const users = Array.isArray(usersData) ? usersData : (usersData.data || []);
        console.log(`[BusinessMapApiAdapter] Usuários obtidos com sucesso! Total: ${users.length}`);
        
        return users.map((user: any) => ({
          user_id: user.user_id,
          username: user.username || '',
          realname: user.realname || user.username || `User ${user.user_id}`,
          email: user.email
        }));
        
      } catch (error) {
        console.error(`[BusinessMapApiAdapter] Erro na tentativa ${attempt} para usuários:`, error);
        
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(1.5, attempt - 1);
            console.log(`[BusinessMapApiAdapter] Rate limit para usuários. Aguardando ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }
        }
        
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          await this.sleep(delay);
          continue;
        }
        
        console.warn('[BusinessMapApiAdapter] Não foi possível buscar usuários, retornando lista vazia');
        return [];
      }
    }
    
    return [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}