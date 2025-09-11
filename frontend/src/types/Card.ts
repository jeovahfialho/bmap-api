export interface ProcessedCard {
  id: number;
  title: string;
  description: string;
  type: 'iniciativa' | 'historia';
  children: ProcessedCard[];
}

export interface ApiResponse {
  success: boolean;
  data: ProcessedCard[];
}