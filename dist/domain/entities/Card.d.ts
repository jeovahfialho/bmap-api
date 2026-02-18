export interface LinkedCard {
    card_id: number;
    link_type: 'child' | 'parent';
}
export interface LoggedTimeEntry {
    id: number;
    user_id: number;
    card_id: number;
    time: number;
    comment?: string;
    date?: string;
}
export interface Card {
    card_id: number;
    title: string;
    description?: string;
    type_id: number;
    board_id?: number;
    first_start_time?: string;
    owner_user_id?: number;
    linked_cards?: LinkedCard[];
    logged_times?: LoggedTimeEntry[];
    co_owner_ids?: number[];
    current_logged_time?: number;
}
export interface UserLoggedTime {
    user_id: number;
    user_name?: string;
    total_time: number;
    entries_count: number;
}
export interface ProcessedCard {
    id: number;
    title: string;
    description: string;
    type: 'iniciativa' | 'historia';
    board_id?: number;
    first_start_time?: string;
    owner_user_id?: number;
    owner_name?: string;
    co_owner_ids?: number[];
    co_owner_names?: string[];
    logged_times_by_user?: UserLoggedTime[];
    total_logged_time?: number;
    children: ProcessedCard[];
}
//# sourceMappingURL=Card.d.ts.map