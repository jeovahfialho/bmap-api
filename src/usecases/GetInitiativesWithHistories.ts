import { CardsRepository } from '../domain/interfaces/CardsRepository';
import { CardsService } from '../domain/interfaces/CardsService';
import { Card, ProcessedCard } from '../domain/entities/Card';

export class GetInitiativesWithHistories implements CardsService {
  constructor(private cardsRepository: CardsRepository) {}

  async getInitiativesWithHistories(): Promise<ProcessedCard[]> {
    const allCards = await this.cardsRepository.getAllCards();
    
    const relevantCards = allCards.filter(card => card.type_id === 1 || card.type_id === 2);
    
    const initiatives = relevantCards.filter(card => card.type_id === 2);
    
    return initiatives.map(initiative => this.processInitiativeWithChildren(initiative, relevantCards));
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