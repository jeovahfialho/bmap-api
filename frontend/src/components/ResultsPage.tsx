import React, { useMemo, useState } from 'react';
import CardComponent from './CardComponent';
import { ProcessedCard } from '../types/Card';

interface Board {
  board_id: number;
  name: string;
  description: string;
  is_archived: boolean;
}

interface ResultsPageProps {
  cards: ProcessedCard[];
  selectedBoards: Board[];
  pagination: { all_pages: number, current_page: number, results_per_page: number } | null;
  onBackToSearch: () => void;
}

// Função para determinar o trimestre
const getQuarter = (dateString?: string): string => {
  if (!dateString) return 'Sem Data';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-11 -> 1-12
  
  const quarter = Math.ceil(month / 3);
  return `Q${quarter} ${year}`;
};

// Agrupa cards por trimestre
const groupByQuarter = (cards: ProcessedCard[]): Map<string, ProcessedCard[]> => {
  const grouped = new Map<string, ProcessedCard[]>();
  
  cards.forEach(card => {
    const quarter = getQuarter(card.first_start_time);
    if (!grouped.has(quarter)) {
      grouped.set(quarter, []);
    }
    grouped.get(quarter)!.push(card);
  });
  
  // Ordena os trimestres
  const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
    if (a[0] === 'Sem Data') return 1;
    if (b[0] === 'Sem Data') return -1;
    return b[0].localeCompare(a[0]); // Ordem decrescente (mais recente primeiro)
  });
  
  return new Map(sortedEntries);
};

// Calcula média Lei do Bem (mesmo mock usado em CardComponent)
const calculateBoardAverage = (cards: ProcessedCard[]): number => {
  const scores = [8.5, 7.2, 9.1, 6.8, 8.9, 7.5, 9.3, 6.5];
  const cardScores = cards.map(card => scores[card.id % scores.length]);
  const average = cardScores.reduce((sum, score) => sum + score, 0) / cardScores.length;
  return Math.round(average * 10) / 10; // Arredonda para 1 casa decimal
};

// Determina o badge baseado na média
const getAverageBadge = (average: number): { label: string; className: string } => {
  if (average >= 8) return { label: 'Ótimo', className: 'excellent' };
  if (average >= 5) return { label: 'Médio', className: 'regular' };
  return { label: 'Baixo', className: 'low' };
};

const ResultsPage: React.FC<ResultsPageProps> = ({ 
  cards, 
  selectedBoards, 
  pagination, 
  onBackToSearch 
}) => {
  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Função para calcular score (mesma lógica do CardComponent)
  const getCardScore = (cardId: number): number => {
    const scores = [8.5, 7.2, 9.1, 6.8, 8.9, 7.5, 9.3, 6.5];
    return scores[cardId % scores.length];
  };

  // Função para determinar status baseado no score
  const getCardStatus = (score: number): string => {
    if (score >= 8) return 'eligible';
    if (score >= 6.5) return 'pending';
    return 'not-eligible';
  };

  // Filtra cards baseado nos critérios
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Filtro de texto
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchTitle = card.title.toLowerCase().includes(searchLower);
        const matchDescription = card.description?.toLowerCase().includes(searchLower);
        const matchId = card.id.toString().includes(searchText);
        
        if (!matchTitle && !matchDescription && !matchId) {
          return false;
        }
      }

      // Filtro de board
      if (selectedBoardFilter !== 'all' && card.board_id !== selectedBoardFilter) {
        return false;
      }

      // Filtro de status
      if (selectedStatus !== 'all') {
        const cardScore = getCardScore(card.id);
        const cardStatus = getCardStatus(cardScore);
        if (cardStatus !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [cards, searchText, selectedBoardFilter, selectedStatus]);

  // Agrupa cards por board_id
  const cardsByBoard = useMemo(() => {
    const grouped = new Map<number, ProcessedCard[]>();
    
    cards.forEach(card => {
      const boardId = card.board_id;
      
      // Se o card tem board_id, agrupa por ele
      if (boardId !== undefined) {
        if (!grouped.has(boardId)) {
          grouped.set(boardId, []);
        }
        grouped.get(boardId)!.push(card);
      }
    });
    
    // Se não conseguiu agrupar nada (cards sem board_id), cria um grupo padrão
    if (grouped.size === 0 && cards.length > 0) {
      const defaultBoardId = selectedBoards[0]?.board_id || 0;
      grouped.set(defaultBoardId, cards);
    }
    
    return grouped;
  }, [cards, selectedBoards]);

  const totalInitiatives = filteredCards.length;
  const totalHistories = filteredCards.reduce((acc, card) => acc + card.children.length, 0);

  // Calcula estatísticas por status
  const stats = useMemo(() => {
    const eligible = filteredCards.filter(card => {
      const score = getCardScore(card.id);
      return getCardStatus(score) === 'eligible';
    }).length;

    const notEligible = filteredCards.filter(card => {
      const score = getCardScore(card.id);
      return getCardStatus(score) === 'not-eligible';
    }).length;

    const pending = filteredCards.filter(card => {
      const score = getCardScore(card.id);
      return getCardStatus(score) === 'pending';
    }).length;

    const total = filteredCards.length || 1; // Evita divisão por zero

    return {
      total: filteredCards.length,
      eligible,
      notEligible,
      pending,
      eligiblePercent: ((eligible / total) * 100).toFixed(1),
      notEligiblePercent: ((notEligible / total) * 100).toFixed(1),
      pendingPercent: ((pending / total) * 100).toFixed(1),
    };
  }, [filteredCards]);

  // Cria um map de board_id para nome do board
  const boardNameMap = useMemo(() => {
    const map = new Map<number, string>();
    selectedBoards.forEach(board => {
      map.set(board.board_id, board.name);
    });
    return map;
  }, [selectedBoards]);

  return (
    <div className="results-page">
      <div className="results-header-clean">
        <button className="back-button-clean" onClick={onBackToSearch}>
          ← Voltar
        </button>
        <div className="results-summary-clean">
          <span className="summary-item">{totalInitiatives} iniciativas</span>
          <span className="summary-divider">•</span>
          <span className="summary-item">{totalHistories} histórias</span>
          <span className="summary-divider">•</span>
          <span className="summary-item">{selectedBoards.length} board(s)</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <div className="filter-group">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por título, descrição ou ID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select"
            value={selectedBoardFilter}
            onChange={(e) => setSelectedBoardFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Todos os Boards</option>
            {selectedBoards.map(board => (
              <option key={board.board_id} value={board.board_id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="eligible">Elegível</option>
            <option value="pending">Pendente</option>
            <option value="not-eligible">Não Elegível</option>
          </select>
        </div>

        {(searchText || selectedBoardFilter !== 'all' || selectedStatus !== 'all') && (
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchText('');
              setSelectedBoardFilter('all');
              setSelectedStatus('all');
            }}
          >
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="results-content-clean">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-title">Total</div>
            <div className="card-value">{stats.total}</div>
            <div className="card-subtitle">{totalHistories} histórias</div>
          </div>

          <div className="summary-card eligible">
            <div className="card-title">Elegíveis</div>
            <div className="card-value">{stats.eligible}</div>
            <div className="card-subtitle">{stats.eligiblePercent}%</div>
            <div className="card-progress">
              <div className="card-progress-bar" style={{ width: `${stats.eligiblePercent}%` }}></div>
            </div>
          </div>

          <div className="summary-card not-eligible">
            <div className="card-title">Não Elegíveis</div>
            <div className="card-value">{stats.notEligible}</div>
            <div className="card-subtitle">{stats.notEligiblePercent}%</div>
            <div className="card-progress">
              <div className="card-progress-bar not-eligible" style={{ width: `${stats.notEligiblePercent}%` }}></div>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="card-title">Pendentes</div>
            <div className="card-value">{stats.pending}</div>
            <div className="card-subtitle">{stats.pendingPercent}%</div>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma iniciativa encontrada</p>
          </div>
        ) : (
          <div className="initiatives-grid">
            {filteredCards.map((card) => (
              <CardComponent 
                key={card.id} 
                card={card} 
                boardName={card.board_id ? boardNameMap.get(card.board_id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;