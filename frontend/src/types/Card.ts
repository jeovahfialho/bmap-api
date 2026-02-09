export interface ProcessedCard {
  id: number;
  title: string;
  description: string;
  type: 'iniciativa' | 'historia';
  board_id?: number;
  first_start_time?: string;
  children: ProcessedCard[];
}

export interface ApiResponse {
  success: boolean;
  data: ProcessedCard[];
  pagination?: {
    all_pages: number;
    current_page: number;
    results_per_page: number;
  };
}