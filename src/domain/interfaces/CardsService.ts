import { ProcessedCard } from '../entities/Card';

export interface CardsService {
  getInitiativesWithHistories(): Promise<ProcessedCard[]>;
}