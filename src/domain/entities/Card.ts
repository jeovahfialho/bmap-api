export interface LinkedCard {
  card_id: number;
  link_type: 'child' | 'parent';
}

export interface Card {
  card_id: number;
  title: string;
  description?: string;
  type_id: number;
  linked_cards?: LinkedCard[];
}

export interface ProcessedCard {
  id: number;
  title: string;
  description: string;
  type: 'iniciativa' | 'historia';
  children: ProcessedCard[];
}