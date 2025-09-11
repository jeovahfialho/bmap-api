import { CardsRepository } from '../domain/interfaces/CardsRepository';
import { CardsService } from '../domain/interfaces/CardsService';
import { Card, ProcessedCard } from '../domain/entities/Card';

export class GetInitiativesWithHistories implements CardsService {
  constructor(private cardsRepository: CardsRepository) {}

  async getInitiativesWithHistories(): Promise<ProcessedCard[]> {
    console.log('[GetInitiativesWithHistories] Iniciando busca de iniciativas com histórias...');
    
    try {
      console.log('[GetInitiativesWithHistories] Buscando todos os cards do repositório...');
      const allCards = await this.cardsRepository.getAllCards();
      console.log(`[GetInitiativesWithHistories] Total de cards obtidos: ${allCards.length}`);
      
      console.log('[GetInitiativesWithHistories] Filtrando cards relevantes (type_id 1 ou 2)...');
      const relevantCards = allCards.filter(card => card.type_id === 1 || card.type_id === 2);
      console.log(`[GetInitiativesWithHistories] Cards relevantes encontrados: ${relevantCards.length}`);
      
      console.log('[GetInitiativesWithHistories] Filtrando apenas iniciativas (type_id 2)...');
      const initiatives = relevantCards.filter(card => card.type_id === 2);
      console.log(`[GetInitiativesWithHistories] Iniciativas encontradas: ${initiatives.length}`);
      
      console.log('[GetInitiativesWithHistories] Processando iniciativas com filhos...');
      const processedInitiatives = initiatives.map(initiative => this.processInitiativeWithChildren(initiative, relevantCards));
      console.log(`[GetInitiativesWithHistories] Iniciativas processadas: ${processedInitiatives.length}`);
      
      return processedInitiatives;
    } catch (error) {
      console.error('[GetInitiativesWithHistories] Erro durante o processamento:', error);
      throw error;
    }
  }

  private processInitiativeWithChildren(initiative: Card, allCards: Card[]): ProcessedCard {
    const childrenIds = initiative.linked_cards
      .filter(link => link.link_type === 'child')
      .map(link => link.card_id);

    const children = childrenIds
      .map(childId => allCards.find(card => card.card_id === childId))
      .filter(card => card !== undefined)
      .map(card => ({
        id: card!.card_id,
        title: card!.title,
        description: card!.description,
        type: 'historia' as const,
        children: []
      }));

    return {
      id: initiative.card_id,
      title: initiative.title,
      description: initiative.description,
      type: 'iniciativa',
      children
    };
  }
}