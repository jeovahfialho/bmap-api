import { Request, Response } from 'express';
import { CardsService } from '../../domain/interfaces/CardsService';

export class CardsController {
  constructor(private cardsService: CardsService) {}

  async getInitiatives(req: Request, res: Response): Promise<void> {
    try {
      const initiatives = await this.cardsService.getInitiativesWithHistories();
      res.json({
        success: true,
        data: initiatives
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}