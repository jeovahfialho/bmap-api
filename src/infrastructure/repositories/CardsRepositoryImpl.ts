import { CardsRepository } from '../../domain/interfaces/CardsRepository';
import { Card } from '../../domain/entities/Card';
import { BusinessMapApiAdapter } from '../adapters/BusinessMapApiAdapter';

export class CardsRepositoryImpl implements CardsRepository {
  constructor(private apiAdapter: BusinessMapApiAdapter) {}

  async getAllCards(queryParams?: Record<string, any>): Promise<Card[]> {
    console.log('[CardsRepositoryImpl] Iniciando busca de cards com filtros...');
    
    try {
      const cards = await this.apiAdapter.fetchCards(queryParams);
      console.log(`[CardsRepositoryImpl] Cards obtidos com sucesso: ${cards.length}`);
      return cards;
    } catch (error) {
      console.error('[CardsRepositoryImpl] Erro ao buscar cards:', error);
      throw error;
    }
  }

  async getCardDetails(cardId: number): Promise<Card> {
    console.log(`[CardsRepositoryImpl] Buscando detalhes do card ${cardId}...`);
    
    try {
      const cardDetails = await this.apiAdapter.fetchCardDetails(cardId);
      console.log(`[CardsRepositoryImpl] Detalhes do card ${cardId} obtidos com sucesso`);
      return cardDetails;
    } catch (error) {
      console.error(`[CardsRepositoryImpl] Erro ao buscar detalhes do card ${cardId}:`, error);
      throw error;
    }
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