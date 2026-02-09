import { CardsRepository } from '../../domain/interfaces/CardsRepository';
import { Card } from '../../domain/entities/Card';
import { BusinessMapApiAdapter } from '../adapters/BusinessMapApiAdapter';

export class CardsRepositoryImpl implements CardsRepository {
  constructor(private apiAdapter: BusinessMapApiAdapter) {}

  async getAllCards(queryParams?: Record<string, any>): Promise<{ cards: Card[], pagination: { all_pages: number, current_page: number, results_per_page: number } }> {
    console.log('[CardsRepositoryImpl] Iniciando busca de cards com filtros...');
    
    try {
      const result = await this.apiAdapter.fetchCards(queryParams);
      console.log(`[CardsRepositoryImpl] Cards obtidos com sucesso: ${result.cards.length}`);
      console.log(`[CardsRepositoryImpl] Paginação:`, result.pagination);
      return result;
    } catch (error) {
      console.error('[CardsRepositoryImpl] Erro ao buscar cards:', error);
      throw error;
    }
  }

  async getCardDetails(cardId: number): Promise<Card> {
    throw new Error('getCardDetails foi deprecado. Use getAllCards com filtros apropriados.');
  }

  async getBoards(): Promise<any[]> {
    console.log('[CardsRepositoryImpl] Buscando boards disponíveis...');
    
    try {
      const boards = await this.apiAdapter.fetchBoards();
      console.log(`[CardsRepositoryImpl] Boards obtidos com sucesso: ${boards.length}`);
      return boards;
    } catch (error) {
      console.error('[CardsRepositoryImpl] Erro ao buscar boards:', error);
      throw error;
    }
  }
}