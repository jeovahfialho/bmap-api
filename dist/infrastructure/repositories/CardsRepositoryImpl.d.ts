import { CardsRepository } from '../../domain/interfaces/CardsRepository';
import { Card } from '../../domain/entities/Card';
import { BusinessMapApiAdapter, UserResponse } from '../adapters/BusinessMapApiAdapter';
export declare class CardsRepositoryImpl implements CardsRepository {
    private apiAdapter;
    constructor(apiAdapter: BusinessMapApiAdapter);
    getAllCards(queryParams?: Record<string, any>): Promise<{
        cards: Card[];
        pagination: {
            all_pages: number;
            current_page: number;
            results_per_page: number;
        };
    }>;
    getCardDetails(cardId: number): Promise<Card>;
    getBoards(): Promise<any[]>;
    getUsers(): Promise<UserResponse[]>;
}
//# sourceMappingURL=CardsRepositoryImpl.d.ts.map