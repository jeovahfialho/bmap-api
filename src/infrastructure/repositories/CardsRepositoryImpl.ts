import { CardsRepository } from '../../domain/interfaces/CardsRepository';
import { Card } from '../../domain/entities/Card';
import { BusinessMapApiAdapter } from '../adapters/BusinessMapApiAdapter';

export class CardsRepositoryImpl implements CardsRepository {
  constructor(private apiAdapter: BusinessMapApiAdapter) {}

  async getAllCards(): Promise<Card[]> {
    console.log('[CardsRepositoryImpl] Iniciando busca de todos os cards...');
    
    try {
      const cards = await this.apiAdapter.fetchCards();
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
}