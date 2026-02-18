"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AIController_1 = require("../controllers/AIController");
const router = (0, express_1.Router)();
const aiController = new AIController_1.AIController();
// Rota para enviar mensagem ao agente
router.post('/agent', (req, res) => aiController.sendMessage(req, res));
// Rota para obter contexto
router.post('/contextual-retrieval', (req, res) => aiController.getContextualRetrieval(req, res));
exports.default = router;
//# sourceMappingURL=aiRoutes.js.map