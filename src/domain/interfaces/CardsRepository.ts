import { Card } from '../entities/Card';

export interface CardsRepository {
  getAllCards(): Promise<Card[]>;
  getCardDetails(cardId: number): Promise<Card>;
}