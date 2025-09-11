import { Router } from 'express';
import { CardsController } from '../controllers/CardsController';
import { GetInitiativesWithHistories } from '../../usecases/GetInitiativesWithHistories';
import { CardsRepositoryImpl } from '../../infrastructure/repositories/CardsRepositoryImpl';
import { BusinessMapApiAdapter } from '../../infrastructure/adapters/BusinessMapApiAdapter';

const router = Router();

const apiAdapter = new BusinessMapApiAdapter();
const cardsRepository = new CardsRepositoryImpl(apiAdapter);
const getInitiativesUseCase = new GetInitiativesWithHistories(cardsRepository);
const cardsController = new CardsController(getInitiativesUseCase);

router.get('/initiatives', (req, res) => cardsController.getInitiatives(req, res));
router.get('/boards', (req, res) => cardsController.getBoards(req, res));

export default router;