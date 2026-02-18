"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardsRepositoryImpl = void 0;
class CardsRepositoryImpl {
    constructor(apiAdapter) {
        this.apiAdapter = apiAdapter;
    }
    async getAllCards(queryParams) {
        console.log('[CardsRepositoryImpl] Iniciando busca de cards com filtros...');
        try {
            const result = await this.apiAdapter.fetchCards(queryParams);
            console.log(`[CardsRepositoryImpl] Cards obtidos com sucesso: ${result.cards.length}`);
            console.log(`[CardsRepositoryImpl] Paginação:`, result.pagination);
            return result;
        }
        catch (error) {
            console.error('[CardsRepositoryImpl] Erro ao buscar cards:', error);
            throw error;
        }
    }
    async getCardDetails(cardId) {
        throw new Error('getCardDetails foi deprecado. Use getAllCards com filtros apropriados.');
    }
    async getBoards() {
        console.log('[CardsRepositoryImpl] Buscando boards disponíveis...');
        try {
            const boards = await this.apiAdapter.fetchBoards();
            console.log(`[CardsRepositoryImpl] Boards obtidos com sucesso: ${boards.length}`);
            return boards;
        }
        catch (error) {
            console.error('[CardsRepositoryImpl] Erro ao buscar boards:', error);
            throw error;
        }
    }
    async getUsers() {
        console.log('[CardsRepositoryImpl] Buscando usuários...');
        try {
            const users = await this.apiAdapter.fetchUsers();
            console.log(`[CardsRepositoryImpl] Usuários obtidos com sucesso: ${users.length}`);
            return users;
        }
        catch (error) {
            console.error('[CardsRepositoryImpl] Erro ao buscar usuários:', error);
            return [];
        }
    }
}
exports.CardsRepositoryImpl = CardsRepositoryImpl;
//# sourceMappingURL=CardsRepositoryImpl.js.map