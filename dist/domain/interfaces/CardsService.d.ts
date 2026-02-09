import { ProcessedCard } from '../entities/Card';
export interface CardsService {
    getInitiativesWithHistories(filters?: Record<string, any>): Promise<{
        processedCards: ProcessedCard[];
        pagination: {
            all_pages: number;
            current_page: number;
            results_per_page: number;
        };
    }>;
}
//# sourceMappingURL=CardsService.d.ts.map