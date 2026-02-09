import { CardsRepository } from '../domain/interfaces/CardsRepository';
import { CardsService } from '../domain/interfaces/CardsService';
import { Card, ProcessedCard } from '../domain/entities/Card';

export class GetInitiativesWithHistories implements CardsService {
  constructor(private cardsRepository: CardsRepository) {}

  async getInitiativesWithHistories(filters?: Record<string, any>): Promise<{ processedCards: ProcessedCard[], pagination: { all_pages: number, current_page: number, results_per_page: number } }> {
    console.log('[GetInitiativesWithHistories] Iniciando busca de iniciativas com histórias...');
    
    try {
      console.log('[GetInitiativesWithHistories] Buscando cards com filtros...');
      console.log('[GetInitiativesWithHistories] Filtros aplicados:', filters);
      const result = await this.cardsRepository.getAllCards(filters);
      const allCards = result.cards;
      const pagination = result.pagination;
      console.log(`[GetInitiativesWithHistories] Total de cards obtidos: ${allCards.length}`);
      console.log(`[GetInitiativesWithHistories] Paginação:`, pagination);
      
      console.log('[GetInitiativesWithHistories] Filtrando apenas iniciativas (type_id 2)...');
      const initiatives = allCards.filter(card => card.type_id === 2);
      console.log(`[GetInitiativesWithHistories] Iniciativas encontradas: ${initiatives.length}`);
      
      console.log('[GetInitiativesWithHistories] Processando iniciativas com filhos...');
      const processedInitiatives = await Promise.all(
        initiatives.map(initiative => this.processInitiativeWithChildren(initiative, allCards))
      );
      console.log(`[GetInitiativesWithHistories] Iniciativas processadas: ${processedInitiatives.length}`);
      
      return { processedCards: processedInitiatives, pagination };
    } catch (error) {
      console.error('[GetInitiativesWithHistories] Erro durante o processamento:', error);
      throw error;
    }
  }

  private async processInitiativeWithChildren(initiative: Card, allCards: Card[]): Promise<ProcessedCard> {
    console.log(`[GetInitiativesWithHistories] Processando iniciativa ${initiative.card_id}: "${initiative.title}"`);
    
    // Verifica se linked_cards existe e é um array
    const linkedCards = initiative.linked_cards || [];
    
    const childrenIds = linkedCards
      .filter(link => link && link.link_type === 'child')
      .map(link => link.card_id);
    
    console.log(`[GetInitiativesWithHistories] Iniciativa ${initiative.card_id} tem ${childrenIds.length} filhos: [${childrenIds.join(', ')}]`);

    const childrenCards = childrenIds
      .map(childId => allCards.find(card => card.card_id === childId))
      .filter(card => card !== undefined) as Card[];
    
    console.log(`[GetInitiativesWithHistories] Encontrados ${childrenCards.length} cards filhos na lista total`);
    console.log(`[GetInitiativesWithHistories] Cards filhos:`, childrenCards.map(c => `${c.card_id} (type: ${c.type_id})`));
    
    const children = childrenCards.map(card => ({
      id: card.card_id,
      title: card.title,
      description: card.description || '',
      type: 'historia' as const,
      board_id: card.board_id,
      first_start_time: card.first_start_time,
      children: []
    }));
    
    console.log(`[GetInitiativesWithHistories] Filhos processados para iniciativa ${initiative.card_id}:`, children.length);

    return {
      id: initiative.card_id,
      title: initiative.title,
      description: initiative.description || '',
      type: 'iniciativa',
      board_id: initiative.board_id,
      first_start_time: initiative.first_start_time,
      children
    };
  }
}