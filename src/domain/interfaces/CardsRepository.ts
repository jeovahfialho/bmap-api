import { Card } from '../entities/Card';
import { Board } from '../../infrastructure/adapters/BusinessMapApiAdapter';

export interface CardsRepository {
  getAllCards(queryParams?: Record<string, any>): Promise<Card[]>;
  getCardDetails(cardId: number): Promise<Card>;
  getBoards(): Promise<Board[]>;
}