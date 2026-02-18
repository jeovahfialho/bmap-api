export interface AIRequest {
    action: string;
    body: {
        data: {
            input: string;
            context: {
                conversation_id: string;
                system: {
                    dialog_turn_counter: number;
                };
                metadata: {
                    user_id: string;
                };
                messages: Array<{
                    role: string;
                    content: string;
                }>;
            };
        };
    };
    agent_id: string;
}
export declare class AIAdapter {
    sendMessage(request: AIRequest, userIdentification?: string): Promise<any>;
    private isRetryableError;
    getContextualRetrieval(input: string, context: any, userIdentification?: string): Promise<any>;
}
//# sourceMappingURL=AIAdapter.d.ts.map