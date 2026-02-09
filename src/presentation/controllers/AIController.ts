import { Request, Response } from 'express';
import { AIAdapter } from '../../infrastructure/adapters/AIAdapter';

export class AIController {
  private aiAdapter: AIAdapter;

  constructor() {
    this.aiAdapter = new AIAdapter();
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userIdentification = req.headers['useridentification'] as string | undefined;

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
    } catch (error: any) {
      console.error('[AIController] Erro:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Erro ao comunicar com a API de IA',
        details: error.response?.data
      });
    }
  }

  async getContextualRetrieval(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.body;
      const userIdentification = req.headers['useridentification'] as string | undefined;

      if (!data || !data.input || !data.context) {
        res.status(400).json({
          success: false,
          error: 'Campos "data.input" e "data.context" são obrigatórios'
        });
        return;
      }

      const result = await this.aiAdapter.getContextualRetrieval(
        data.input,
        data.context,
        userIdentification
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[AIController] Erro no contextual retrieval:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Erro ao buscar contexto',
        details: error.response?.data
      });
    }
  }
}
