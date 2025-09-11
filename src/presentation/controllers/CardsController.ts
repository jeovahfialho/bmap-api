import { Request, Response } from 'express';
import { CardsService } from '../../domain/interfaces/CardsService';

export class CardsController {
  constructor(private cardsService: CardsService) {}

  async getInitiatives(req: Request, res: Response): Promise<void> {
    console.log('[CardsController] Iniciando busca de iniciativas...');
    
    try {
      console.log('[CardsController] Chamando cardsService.getInitiativesWithHistories()...');
      const initiatives = await this.cardsService.getInitiativesWithHistories();
      
      console.log(`[CardsController] Sucesso! Encontradas ${initiatives.length} iniciativas`);
      console.log('[CardsController] Primeiras iniciativas:', initiatives.slice(0, 2));
      
      res.json({
        success: true,
        data: initiatives
      });
    } catch (error) {
      console.error('[CardsController] Erro ao buscar iniciativas:', error);
      console.error('[CardsController] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}