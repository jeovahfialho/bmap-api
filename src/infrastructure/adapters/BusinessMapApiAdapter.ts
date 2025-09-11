import axios from 'axios';
import { Card } from '../../domain/entities/Card';

export interface BusinessMapApiResponse {
  data: {
    data: Array<{
      card_id: number;
      title: string;
      description: string;
      type_id: number;
      linked_cards: Array<{
        card_id: number;
        link_type: 'child' | 'parent';
      }>;
    }>;
  };
}

export class BusinessMapApiAdapter {
  private readonly baseUrl = 'middleware.bi.businessmap.dem.intranet.bb.com.br';

  async fetchCards(): Promise<Card[]> {
    try {
      const response = await axios.get<BusinessMapApiResponse>(
        `https://${this.baseUrl}/api/v2/cards`
      );

      return response.data.data.data.map(card => ({
        card_id: card.card_id,
        title: card.title,
        description: card.description,
        type_id: card.type_id,
        linked_cards: card.linked_cards
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar cards da API: ${error}`);
    }
  }
}