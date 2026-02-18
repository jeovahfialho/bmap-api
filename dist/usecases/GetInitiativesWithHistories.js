"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInitiativesWithHistories = void 0;
class GetInitiativesWithHistories {
    constructor(cardsRepository) {
        this.cardsRepository = cardsRepository;
    }
    async getInitiativesWithHistories(filters) {
        console.log('[GetInitiativesWithHistories] Iniciando busca de iniciativas com histórias...');
        try {
            // Busca cards e usuários em paralelo
            console.log('[GetInitiativesWithHistories] Buscando cards e usuários...');
            const [result, users] = await Promise.all([
                this.cardsRepository.getAllCards(filters),
                this.cardsRepository.getUsers()
            ]);
            const allCards = result.cards;
            const pagination = result.pagination;
            console.log(`[GetInitiativesWithHistories] Total de cards obtidos: ${allCards.length}`);
            console.log(`[GetInitiativesWithHistories] Total de usuários obtidos: ${users.length}`);
            // Cria mapa de user_id → nome
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user.user_id, user.realname || user.username || `User ${user.user_id}`);
            });
            console.log(`[GetInitiativesWithHistories] Mapa de usuários criado com ${userMap.size} entradas`);
            // Filtra por type_id e board_ids selecionados
            const boardIds = filters?.board_ids?.map((id) => Number(id)) || [];
            console.log('[GetInitiativesWithHistories] Filtrando iniciativas (type_id 2) dos boards:', boardIds);
            const initiatives = allCards.filter(card => {
                if (card.type_id !== 2)
                    return false;
                if (boardIds.length > 0 && card.board_id && !boardIds.includes(card.board_id))
                    return false;
                return true;
            });
            console.log(`[GetInitiativesWithHistories] Iniciativas encontradas: ${initiatives.length}`);
            console.log('[GetInitiativesWithHistories] Processando iniciativas com filhos...');
            const processedInitiatives = await Promise.all(initiatives.map(initiative => this.processInitiativeWithChildren(initiative, allCards, userMap)));
            console.log(`[GetInitiativesWithHistories] Iniciativas processadas: ${processedInitiatives.length}`);
            return { processedCards: processedInitiatives, pagination };
        }
        catch (error) {
            console.error('[GetInitiativesWithHistories] Erro durante o processamento:', error);
            throw error;
        }
    }
    aggregateLoggedTimesByUser(card, userMap) {
        const loggedTimes = card.logged_times || [];
        if (loggedTimes.length === 0)
            return [];
        const aggregated = new Map();
        for (const entry of loggedTimes) {
            const existing = aggregated.get(entry.user_id) || { total_time: 0, entries_count: 0 };
            existing.total_time += entry.time || 0;
            existing.entries_count += 1;
            aggregated.set(entry.user_id, existing);
        }
        const result = [];
        aggregated.forEach((data, userId) => {
            result.push({
                user_id: userId,
                user_name: userMap.get(userId) || `User ${userId}`,
                total_time: data.total_time,
                entries_count: data.entries_count
            });
        });
        // Ordena por tempo total decrescente
        result.sort((a, b) => b.total_time - a.total_time);
        return result;
    }
    async processInitiativeWithChildren(initiative, allCards, userMap) {
        console.log(`[GetInitiativesWithHistories] Processando iniciativa ${initiative.card_id}: "${initiative.title}"`);
        // Verifica se linked_cards existe e é um array
        const linkedCards = initiative.linked_cards || [];
        const childrenIds = linkedCards
            .filter(link => link && link.link_type === 'child')
            .map(link => link.card_id);
        console.log(`[GetInitiativesWithHistories] Iniciativa ${initiative.card_id} tem ${childrenIds.length} filhos: [${childrenIds.join(', ')}]`);
        const childrenCards = childrenIds
            .map(childId => allCards.find(card => card.card_id === childId))
            .filter(card => card !== undefined);
        console.log(`[GetInitiativesWithHistories] Encontrados ${childrenCards.length} cards filhos na lista total`);
        const children = childrenCards.map(card => ({
            id: card.card_id,
            title: card.title,
            description: card.description || '',
            type: 'historia',
            board_id: card.board_id,
            first_start_time: card.first_start_time,
            owner_user_id: card.owner_user_id,
            owner_name: card.owner_user_id ? (userMap.get(card.owner_user_id) || `User ${card.owner_user_id}`) : undefined,
            co_owner_ids: card.co_owner_ids || [],
            co_owner_names: (card.co_owner_ids || []).map(id => userMap.get(id) || `User ${id}`),
            logged_times_by_user: this.aggregateLoggedTimesByUser(card, userMap),
            total_logged_time: card.current_logged_time || 0,
            children: []
        }));
        console.log(`[GetInitiativesWithHistories] Filhos processados para iniciativa ${initiative.card_id}:`, children.length);
        // Agrega tempos da iniciativa
        const initiativeLoggedTimes = this.aggregateLoggedTimesByUser(initiative, userMap);
        return {
            id: initiative.card_id,
            title: initiative.title,
            description: initiative.description || '',
            type: 'iniciativa',
            board_id: initiative.board_id,
            first_start_time: initiative.first_start_time,
            owner_user_id: initiative.owner_user_id,
            owner_name: initiative.owner_user_id ? (userMap.get(initiative.owner_user_id) || `User ${initiative.owner_user_id}`) : undefined,
            co_owner_ids: initiative.co_owner_ids || [],
            co_owner_names: (initiative.co_owner_ids || []).map(id => userMap.get(id) || `User ${id}`),
            logged_times_by_user: initiativeLoggedTimes,
            total_logged_time: initiative.current_logged_time || 0,
            children
        };
    }
}
exports.GetInitiativesWithHistories = GetInitiativesWithHistories;
//# sourceMappingURL=GetInitiativesWithHistories.js.map