import { ProcessedCard } from '../entities/Card';

export interface CardsService {
  getInitiativesWithHistories(filters?: Record<string, any>): Promise<ProcessedCard[]>;
}