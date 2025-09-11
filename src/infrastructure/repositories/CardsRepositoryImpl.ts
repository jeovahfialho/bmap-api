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
}