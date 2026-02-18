"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const AIAdapter_1 = require("../../infrastructure/adapters/AIAdapter");
class AIController {
    constructor() {
        this.aiAdapter = new AIAdapter_1.AIAdapter();
    }
    async sendMessage(req, res) {
        try {
            const userIdentification = req.headers['useridentification'];
            console.log('[AIController] Request recebido:', {
                body: req.body,
                userIdentification
            });
            // Valida o novo formato da API
            if (!req.body.action || !req.body.body?.data?.input || !req.body.agent_id) {
                res.status(400).json({
                    success: false,
                    error: 'Formato inválido. Esperado: { action, body: { data: { input, context } }, agent_id }'
                });
                return;
            }
            const result = await this.aiAdapter.sendMessage(req.body, userIdentification);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('[AIController] Erro:', error);
            res.status(error.response?.status || 500).json({
                success: false,
                error: error.message || 'Erro ao comunicar com a API de IA',
                details: error.response?.data
            });
        }
    }
    async getContextualRetrieval(req, res) {
        try {
            const { data } = req.body;
            const userIdentification = req.headers['useridentification'];
            if (!data || !data.input || !data.context) {
                res.status(400).json({
                    success: false,
                    error: 'Campos "data.input" e "data.context" são obrigatórios'
                });
                return;
            }
            const result = await this.aiAdapter.getContextualRetrieval(data.input, data.context, userIdentification);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('[AIController] Erro no contextual retrieval:', error);
            res.status(error.response?.status || 500).json({
                success: false,
                error: error.message || 'Erro ao buscar contexto',
                details: error.response?.data
            });
        }
    }
}
exports.AIController = AIController;
//# sourceMappingURL=AIController.js.map