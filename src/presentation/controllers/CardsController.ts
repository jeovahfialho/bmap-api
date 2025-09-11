import { Request, Response } from 'express';
import { CardsService } from '../../domain/interfaces/CardsService';

export class CardsController {
  constructor(private cardsService: CardsService) {}

  async getInitiatives(req: Request, res: Response): Promise<void> {
    console.log('[CardsController] Iniciando busca de iniciativas...');
    
    try {
      // Extrai filtros dos query parameters
      const filters: Record<string, any> = {};
      
      if (req.query.board_ids) {
        filters.board_ids = Array.isArray(req.query.board_ids) 
          ? req.query.board_ids 
          : [req.query.board_ids];
      }
      
      if (req.query.page) filters.page = req.query.page;
      if (req.query.per_page) filters.per_page = req.query.per_page;
      
      console.log('[CardsController] Filtros recebidos:', filters);
      console.log('[CardsController] Chamando cardsService.getInitiativesWithHistories()...');
      const initiatives = await this.cardsService.getInitiativesWithHistories(filters);
      
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

  async getBoards(req: Request, res: Response): Promise<void> {
    console.log('[CardsController] ===== ROTA /api/boards CHAMADA =====');
    
    try {
      // Como o service não tem getBoards, vou acessar diretamente o repositório
      // TODO: Refatorar para criar um service apropriado
      const cardsRepository = (this.cardsService as any).cardsRepository;
      const boards = await cardsRepository.getBoards();
      
      console.log(`[CardsController] Boards encontrados: ${boards.length}`);
      
      res.json({
        success: true,
        data: boards
      });
    } catch (error) {
      console.error('[CardsController] Erro ao buscar boards:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar boards',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}