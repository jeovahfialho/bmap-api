"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardsController = void 0;
class CardsController {
    constructor(cardsService) {
        this.cardsService = cardsService;
    }
    async getInitiatives(req, res) {
        console.log('[CardsController] Iniciando busca de iniciativas...');
        try {
            // Extrai filtros dos query parameters
            const filters = {};
            if (req.query.board_ids) {
                // board_ids pode vir como "804,351,352" (string com vírgulas) ou como array
                const raw = req.query.board_ids;
                if (typeof raw === 'string') {
                    filters.board_ids = raw.split(',').map(id => id.trim());
                }
                else if (Array.isArray(raw)) {
                    filters.board_ids = raw.map(id => String(id).trim());
                }
            }
            if (req.query.page)
                filters.page = req.query.page;
            if (req.query.per_page)
                filters.per_page = req.query.per_page;
            console.log('[CardsController] Filtros recebidos:', filters);
            console.log('[CardsController] Chamando cardsService.getInitiativesWithHistories()...');
            const result = await this.cardsService.getInitiativesWithHistories(filters);
            console.log(`[CardsController] Sucesso! Encontradas ${result.processedCards.length} iniciativas`);
            console.log('[CardsController] Paginação:', result.pagination);
            console.log('[CardsController] Primeiras iniciativas:', result.processedCards.slice(0, 2));
            res.json({
                success: true,
                data: result.processedCards,
                pagination: result.pagination
            });
        }
        catch (error) {
            console.error('[CardsController] Erro ao buscar iniciativas:', error);
            console.error('[CardsController] Stack trace:', error instanceof Error ? error.stack : 'N/A');
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    async getBoards(req, res) {
        console.log('[CardsController] ===== ROTA /api/boards CHAMADA =====');
        try {
            // Como o service não tem getBoards, vou acessar diretamente o repositório
            // TODO: Refatorar para criar um service apropriado
            const cardsRepository = this.cardsService.cardsRepository;
            const boards = await cardsRepository.getBoards();
            console.log(`[CardsController] Boards encontrados: ${boards.length}`);
            res.json({
                success: true,
                data: boards
            });
        }
        catch (error) {
            console.error('[CardsController] Erro ao buscar boards:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor ao buscar boards',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
exports.CardsController = CardsController;
//# sourceMappingURL=CardsController.js.map