import { Router } from 'express';
import { AIController } from '../controllers/AIController';

const router = Router();
const aiController = new AIController();

// Rota para enviar mensagem ao agente
router.post('/agent', (req, res) => aiController.sendMessage(req, res));

// Rota para obter contexto
router.post('/contextual-retrieval', (req, res) => aiController.getContextualRetrieval(req, res));

export default router;
