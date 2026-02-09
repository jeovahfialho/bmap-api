export interface LinkedCard {
  card_id: number;
  link_type: 'child' | 'parent';
}

export interface Card {
  card_id: number;
  title: string;
  description?: string;
  type_id: number;
  board_id?: number;
  first_start_time?: string;
  linked_cards?: LinkedCard[];
}

export interface ProcessedCard {
  id: number;
  title: string;
  description: string;
  type: 'iniciativa' | 'historia';
  board_id?: number;
  first_start_time?: string;
  children: ProcessedCard[];
}