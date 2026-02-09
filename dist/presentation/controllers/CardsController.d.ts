import { Request, Response } from 'express';
import { CardsService } from '../../domain/interfaces/CardsService';
export declare class CardsController {
    private cardsService;
    constructor(cardsService: CardsService);
    getInitiatives(req: Request, res: Response): Promise<void>;
    getBoards(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=CardsController.d.ts.map