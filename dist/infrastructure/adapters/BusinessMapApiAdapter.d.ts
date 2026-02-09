import { Card } from '../../domain/entities/Card';
export interface BusinessMapApiResponse {
    data: {
        pagination: {
            all_pages: number;
            current_page: number;
            results_per_page: number;
        };
        data: Array<{
            card_id: number;
            title: string;
            description?: string;
            type_id: number;
            linked_cards?: Array<{
                card_id: number;
                link_type: 'child' | 'parent';
            }>;
        }>;
    };
}
export interface CardDetailResponse {
    data: {
        card_id: number;
        title: string;
        description: string;
        type_id: number;
        linked_cards: Array<{
            card_id: number;
            link_type: 'child' | 'parent';
        }>;
    };
}
export interface BoardsResponse {
    data: Array<{
        board_id: number;
        workspace_id: number;
        is_archived: number;
        name: string;
        description: string;
        type: number;
    }>;
}
export interface Board {
    board_id: number;
    name: string;
    description: string;
    is_archived: boolean;
}
export declare class BusinessMapApiAdapter {
    private readonly baseUrl;
    fetchBoards(): Promise<Board[]>;
    fetchCards(queryParams?: Record<string, any>): Promise<{
        cards: Card[];
        pagination: {
            all_pages: number;
            current_page: number;
            results_per_page: number;
        };
    }>;
    private sleep;
}
//# sourceMappingURL=BusinessMapApiAdapter.d.ts.map