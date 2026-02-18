import { Request, Response } from 'express';
export declare class AIController {
    private aiAdapter;
    constructor();
    sendMessage(req: Request, res: Response): Promise<void>;
    getContextualRetrieval(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AIController.d.ts.map