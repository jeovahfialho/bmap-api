import { Card } from '../entities/Card';
import { Board } from '../../infrastructure/adapters/BusinessMapApiAdapter';
export interface CardsRepository {
    getAllCards(queryParams?: Record<string, any>): Promise<{
        cards: Card[];
        pagination: {
            all_pages: number;
            current_page: number;
            results_per_page: number;
        };
    }>;
    getCardDetails(cardId: number): Promise<Card>;
    getBoards(): Promise<Board[]>;
}
//# sourceMappingURL=CardsRepository.d.ts.map