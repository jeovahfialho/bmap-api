"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessMapApiAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class BusinessMapApiAdapter {
    constructor() {
        this.baseUrl = 'middleware.bi.businessmap.dem.intranet.bb.com.br';
    }
    async fetchBoards() {
        const maxRetries = 5;
        const baseDelay = 500;
        console.log('[BusinessMapApiAdapter] Buscando boards disponíveis...');
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[BusinessMapApiAdapter] Tentativa ${attempt}/${maxRetries} para boards`);
                const response = await axios_1.default.get(`http://${this.baseUrl}/api/v2/boards`);
                const boardsData = response.data.data || response.data;
                console.log(`[BusinessMapApiAdapter] Boards obtidos com sucesso! Total: ${boardsData.length}`);
                const boards = boardsData.map((board) => ({
                    board_id: board.board_id,
                    name: board.name,
                    description: board.description,
                    is_archived: board.is_archived === 1
                }));
                return boards;
            }
            catch (error) {
                console.error(`[BusinessMapApiAdapter] Erro na tentativa ${attempt} para boards:`, error);
                if (axios_1.default.isAxiosError(error) && error.response?.status === 429) {
                    if (attempt < maxRetries) {
                        const delay = baseDelay * Math.pow(1.5, attempt - 1);
                        console.log(`[BusinessMapApiAdapter] Rate limit para boards. Aguardando ${delay}ms...`);
                        await this.sleep(delay);
                        continue;
                    }
                }
                if (attempt < maxRetries) {
                    const delay = baseDelay * attempt;
                    await this.sleep(delay);
                    continue;
                }
                throw new Error(`Erro ao buscar boards: ${error instanceof Error ? error.message : error}`);
            }
        }
        throw new Error('Erro inesperado ao buscar boards');
    }
    async fetchCards(queryParams) {
        const maxRetries = 15;
        const baseDelay = 1000; // 1 segundo
        // Constrói a URL com parâmetros de query
        const urlParams = new URLSearchParams();
        // Adiciona parâmetros customizados se fornecidos
        if (queryParams) {
            Object.entries(queryParams).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => urlParams.append(key, v.toString()));
                }
                else if (value !== undefined && value !== null) {
                    urlParams.append(key, value.toString());
                }
            });
        }
        // Parâmetros padrão para otimizar a busca
        if (!queryParams?.type_ids) {
            urlParams.append('type_ids', '2'); // Apenas iniciativas por padrão
        }
        // Adiciona campos específicos para evitar dados desnecessários
        if (!queryParams?.fields) {
            urlParams.append('fields', 'card_id,title,description,type_id,linked_cards');
        }
        // Sempre expande linked_cards para relações
        if (!queryParams?.expand) {
            urlParams.append('expand', 'linked_cards');
        }
        const queryString = urlParams.toString();
        const fullUrl = `http://${this.baseUrl}/api/v2/cards${queryString ? `?${queryString}` : ''}`;
        console.log('[BusinessMapApiAdapter] Iniciando requisição para a API externa...');
        console.log(`[BusinessMapApiAdapter] URL: ${fullUrl}`);
        console.log(`[BusinessMapApiAdapter] Máximo de tentativas: ${maxRetries}`);
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await axios_1.default.get(fullUrl);
                console.log(`[BusinessMapApiAdapter] Sucesso! ${response.data.data.data.length} cards obtidos`);
                console.log(`[BusinessMapApiAdapter] Paginação:`, response.data.data.pagination);
                if (!response.data?.data?.data) {
                    console.error('[BusinessMapApiAdapter] Estrutura de resposta inesperada:', response.data);
                    throw new Error('Estrutura de resposta da API não conforme esperado');
                }
                const rawCards = response.data.data.data;
                const pagination = response.data.data.pagination;
                const mappedCards = rawCards.map(card => ({
                    card_id: card.card_id,
                    title: card.title,
                    description: card.description || undefined,
                    type_id: card.type_id,
                    linked_cards: card.linked_cards || []
                }));
                return { cards: mappedCards, pagination };
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const status = error.response?.status;
                    // Se é erro 429 (Too Many Requests), tenta novamente
                    if (status === 429) {
                        if (attempt < maxRetries) {
                            const delay = baseDelay * Math.pow(1.5, attempt - 1);
                            console.log(`[BusinessMapApiAdapter] Rate limit - aguardando ${delay}ms...`);
                            await this.sleep(delay);
                            continue;
                        }
                        else {
                            console.error('[BusinessMapApiAdapter] Máximo de tentativas atingido');
                            throw new Error('A API externa está temporariamente indisponível devido ao limite de requisições. Tente novamente em alguns minutos.');
                        }
                    }
                    // Para outros erros HTTP, mostra detalhes
                    console.error('[BusinessMapApiAdapter] Erro HTTP:', status, error.response?.statusText);
                    // Para outros erros HTTP, não tenta novamente
                    throw new Error(`Erro HTTP ${status}: ${error.response?.statusText || 'Erro desconhecido'}`);
                }
                // Para erros de rede ou outros, tenta novamente apenas se não for a última tentativa
                if (attempt < maxRetries) {
                    const delay = baseDelay * attempt;
                    console.log(`[BusinessMapApiAdapter] Erro de rede. Aguardando ${delay}ms antes da próxima tentativa...`);
                    await this.sleep(delay);
                    continue;
                }
                throw new Error(`Erro ao buscar cards da API após ${maxRetries} tentativas: ${error instanceof Error ? error.message : error}`);
            }
        }
        throw new Error(`Erro inesperado: todas as ${maxRetries} tentativas foram esgotadas`);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.BusinessMapApiAdapter = BusinessMapApiAdapter;
//# sourceMappingURL=BusinessMapApiAdapter.js.map