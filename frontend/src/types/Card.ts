export interface AIEvaluationResult {
  status: 'eligible' | 'not-eligible' | 'pending' | 'analyzing' | 'error';
  classification?: string;
  pdiIndication?: string;
  justification?: string;
  suggestion?: string;
  rawResponse?: string;
}

export interface UserLoggedTime {
  user_id: number;
  user_name?: string;
  total_time: number; // em segundos
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

export interface ApiResponse {
  success: boolean;
  data: ProcessedCard[];
  pagination?: {
    all_pages: number;
    current_page: number;
    results_per_page: number;
  };
}