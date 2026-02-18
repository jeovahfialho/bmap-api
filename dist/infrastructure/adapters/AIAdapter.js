"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const AI_API_URL = 'https://generabb-acs.gbb.servicos.bb.com.br/gateway/agent';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 90000; // 90 segundos
// Agent HTTPS que ignora certificados auto-assinados
const httpsAgent = new https_1.default.Agent({
    rejectUnauthorized: false
});
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class AIAdapter {
    async sendMessage(request, userIdentification) {
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'UOR': '459616',
            'X-Client-Id': 'eyJpZCI6IiIsImNvZGlnb1B1YmxpY2Fkb3IiOjAsImNvZGlnb1NvZnR3YXJlIjo1OTkxNywic2VxdWVuY2lhbEluc3RhbGFjYW8iOjJ9',
            'userIdentification': userIdentification || 'F4690059',
        };
        if (userIdentification) {
            headers['userIdentification'] = userIdentification;
        }
        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[AIAdapter] Tentativa ${attempt}/${MAX_RETRIES} - Enviando request para:`, AI_API_URL);
                const response = await axios_1.default.post(AI_API_URL, request, {
                    headers,
                    timeout: REQUEST_TIMEOUT_MS,
                    httpsAgent
                });
                console.log('[AIAdapter] Resposta recebida:', JSON.stringify(response.data, null, 2));
                return response.data;
            }
            catch (error) {
                lastError = error;
                const isRetryable = this.isRetryableError(error);
                if (axios_1.default.isAxiosError(error)) {
                    console.error(`[AIAdapter] Erro na tentativa ${attempt}/${MAX_RETRIES}:`, {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message,
                        retryable: isRetryable
                    });
                }
                else {
                    console.error(`[AIAdapter] Erro na tentativa ${attempt}/${MAX_RETRIES}:`, error);
                }
                if (!isRetryable || attempt === MAX_RETRIES) {
                    break;
                }
                const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(`[AIAdapter] Aguardando ${delay}ms antes de tentar novamente...`);
                await sleep(delay);
            }
        }
        throw lastError;
    }
    isRetryableError(error) {
        if (axios_1.default.isAxiosError(error)) {
            // Timeout or network errors are retryable
            if (!error.response)
                return true; // network error / timeout
            const status = error.response.status;
            // 429 NÃO é retryable no backend - devolvemos ao frontend para ele controlar o timing
            return status >= 500; // Apenas 5xx
        }
        return false; // Non-axios errors are not retryable
    }
    async getContextualRetrieval(input, context, userIdentification) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (userIdentification) {
                headers['userIdentification'] = userIdentification;
            }
            const response = await axios_1.default.post(`${AI_API_URL}/acs/llms/contextual_retrieval`, { data: { input, context } }, { headers });
            return response.data;
        }
        catch (error) {
            console.error('[AIAdapter] Erro no contextual retrieval:', error);
            throw error;
        }
    }
}
exports.AIAdapter = AIAdapter;
//# sourceMappingURL=AIAdapter.js.map