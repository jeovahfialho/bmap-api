import { CardsRepository } from '../domain/interfaces/CardsRepository';
import { CardsService } from '../domain/interfaces/CardsService';
import { ProcessedCard } from '../domain/entities/Card';
export declare class GetInitiativesWithHistories implements CardsService {
    private cardsRepository;
    constructor(cardsRepository: CardsRepository);
    getInitiativesWithHistories(filters?: Record<string, any>): Promise<{
        processedCards: ProcessedCard[];
        pagination: {
            all_pages: number;
            current_page: number;
            results_per_page: number;
        };
    }>;
    private aggregateLoggedTimesByUser;
    private processInitiativeWithChildren;
}
//# sourceMappingURL=GetInitiativesWithHistories.d.ts.map