"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CardsController_1 = require("../controllers/CardsController");
const GetInitiativesWithHistories_1 = require("../../usecases/GetInitiativesWithHistories");
const CardsRepositoryImpl_1 = require("../../infrastructure/repositories/CardsRepositoryImpl");
const BusinessMapApiAdapter_1 = require("../../infrastructure/adapters/BusinessMapApiAdapter");
const router = (0, express_1.Router)();
const apiAdapter = new BusinessMapApiAdapter_1.BusinessMapApiAdapter();
const cardsRepository = new CardsRepositoryImpl_1.CardsRepositoryImpl(apiAdapter);
const getInitiativesUseCase = new GetInitiativesWithHistories_1.GetInitiativesWithHistories(cardsRepository);
const cardsController = new CardsController_1.CardsController(getInitiativesUseCase);
router.get('/initiatives', (req, res) => cardsController.getInitiatives(req, res));
router.get('/boards', (req, res) => cardsController.getBoards(req, res));
exports.default = router;
//# sourceMappingURL=cardsRoutes.js.map