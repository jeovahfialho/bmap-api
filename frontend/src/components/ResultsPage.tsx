import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CardComponent from './CardComponent';
import { ProcessedCard, AIEvaluationResult } from '../types/Card';
import { batchEvaluateCards } from '../services/aiService';

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
  isLoadingCards?: boolean;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ 
  cards, 
  selectedBoards, 
  pagination, 
  onBackToSearch,
  isLoadingCards = false 
}) => {
  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estado das avaliações da IA
  const [aiEvaluations, setAiEvaluations] = useState<Map<number, AIEvaluationResult>>(new Map());
  const [evaluationProgress, setEvaluationProgress] = useState({ total: 0, completed: 0, running: false });

  // Batch AI evaluation - dispara somente quando os cards terminam de carregar
  useEffect(() => {
    if (isLoadingCards || cards.length === 0) return;

    // Inicializa todas como "analyzing"
    const initialEvals = new Map<number, AIEvaluationResult>();
    cards.forEach(card => {
      initialEvals.set(card.id, { status: 'analyzing' });
    });
    setAiEvaluations(new Map(initialEvals));
    setEvaluationProgress({ total: cards.length, completed: 0, running: true });

    let completedCount = 0;

    batchEvaluateCards(
      cards,
      (cardId, result) => {
        completedCount++;
        setAiEvaluations(prev => {
          const next = new Map(prev);
          next.set(cardId, result);
          return next;
        });
        setEvaluationProgress(prev => ({ ...prev, completed: completedCount }));
      }
    ).then(() => {
      setEvaluationProgress(prev => ({ ...prev, running: false }));
      console.log('[ResultsPage] Batch AI evaluation completed');
    }).catch(err => {
      console.error('[ResultsPage] Batch AI evaluation error:', err);
      setEvaluationProgress(prev => ({ ...prev, running: false }));
    });
  }, [cards, isLoadingCards]);

  // Função para obter status de um card a partir das avaliações da IA
  const getCardAIStatus = useCallback((cardId: number): string => {
    const evaluation = aiEvaluations.get(cardId);
    if (!evaluation) return 'analyzing';
    return evaluation.status;
  }, [aiEvaluations]);

  // Retry de cards com erro
  const retryFailedEvaluations = useCallback(() => {
    const failedCards = cards.filter(card => {
      const evaluation = aiEvaluations.get(card.id);
      return evaluation && evaluation.status === 'error';
    });

    if (failedCards.length === 0) return;

    // Marca os falhados como "analyzing" novamente
    setAiEvaluations(prev => {
      const next = new Map(prev);
      failedCards.forEach(card => {
        next.set(card.id, { status: 'analyzing' });
      });
      return next;
    });
    setEvaluationProgress(prev => ({ ...prev, running: true, completed: prev.total - failedCards.length }));

    let retriedCount = 0;

    batchEvaluateCards(
      failedCards,
      (cardId, result) => {
        retriedCount++;
        setAiEvaluations(prev => {
          const next = new Map(prev);
          next.set(cardId, result);
          return next;
        });
        setEvaluationProgress(prev => ({ ...prev, completed: prev.total - failedCards.length + retriedCount }));
      },
      1
    ).then(() => {
      setEvaluationProgress(prev => ({ ...prev, running: false }));
      console.log('[ResultsPage] Retry evaluation completed');
    }).catch(err => {
      console.error('[ResultsPage] Retry evaluation error:', err);
      setEvaluationProgress(prev => ({ ...prev, running: false }));
    });
  }, [cards, aiEvaluations]);

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
        const cardStatus = getCardAIStatus(card.id);
        if (cardStatus !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [cards, searchText, selectedBoardFilter, selectedStatus, getCardAIStatus]);

  const totalInitiatives = filteredCards.length;
  const totalHistories = filteredCards.reduce((acc, card) => acc + card.children.length, 0);

  // Calcula estatísticas por status (baseado nas avaliações da IA)
  const stats = useMemo(() => {
    const eligible = filteredCards.filter(card => getCardAIStatus(card.id) === 'eligible').length;
    const notEligible = filteredCards.filter(card => getCardAIStatus(card.id) === 'not-eligible').length;
    const errorCount = filteredCards.filter(card => getCardAIStatus(card.id) === 'error').length;
    const analyzing = filteredCards.filter(card => getCardAIStatus(card.id) === 'analyzing').length;
    const pending = filteredCards.filter(card => getCardAIStatus(card.id) === 'pending').length;

    const total = filteredCards.length || 1;

    return {
      total: filteredCards.length,
      eligible,
      notEligible,
      pending,
      errorCount,
      analyzing,
      pendingAndAnalyzing: pending + analyzing,
      eligiblePercent: ((eligible / total) * 100).toFixed(1),
      notEligiblePercent: ((notEligible / total) * 100).toFixed(1),
      pendingPercent: (((pending + analyzing) / total) * 100).toFixed(1),
      errorPercent: ((errorCount / total) * 100).toFixed(1),
    };
  }, [filteredCards, getCardAIStatus]);

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
      {/* bb-navbar-header para resultados */}
      <header className="bbds-navbar">
        <div className="bbds-navbar-content">
          <div className="bbds-navbar-brand">
            <button className="bbds-btn bbds-btn-sm" onClick={onBackToSearch}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              ← Voltar
            </button>
            <div>
              <div className="bbds-navbar-title">Resultados</div>
              <div className="bbds-navbar-subtitle">
                {isLoadingCards ? (
                  <span>Buscando iniciativas dos boards selecionados...</span>
                ) : (
                  <>
                    {totalInitiatives} iniciativas • {totalHistories} histórias • {selectedBoards.length} board(s)
                    {evaluationProgress.running && (
                      <span style={{ marginLeft: '12px', fontSize: '12px', opacity: 0.8 }}>
                        ⏳ Análise IA: {evaluationProgress.completed}/{evaluationProgress.total}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bbds-layout">
        <div className="bbds-layout-content">
          {/* bb-filter: Barra de filtros */}
          <div className="bbds-filter-bar" style={{ marginBottom: '24px' }}>
            <div className="bbds-field" style={{ flex: 2, marginBottom: 0, position: 'relative' }}>
              <span className="bbds-field-search-icon">🔍</span>
              <input
                type="text"
                className="bbds-field-input bbds-field-input--search"
                placeholder="Buscar por título, descrição ou ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <select 
                className="bbds-field-select"
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

            <div style={{ flex: 1 }}>
              <select 
                className="bbds-field-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="eligible">Elegível</option>
                <option value="pending">Pendente</option>
                <option value="not-eligible">Não Elegível</option>
                <option value="error">Erro na análise</option>
                <option value="analyzing">Analisando</option>
              </select>
            </div>

            {(searchText || selectedBoardFilter !== 'all' || selectedStatus !== 'all') && (
              <button 
                className="bbds-btn bbds-btn-tertiary bbds-btn-sm"
                onClick={() => {
                  setSearchText('');
                  setSelectedBoardFilter('all');
                  setSelectedStatus('all');
                }}
              >
                ✕ Limpar
              </button>
            )}
          </div>

          {/* Barra de progresso da Análise IA */}
          {evaluationProgress.running && evaluationProgress.total > 0 && (
            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bbds-surface-soft, #FAFAFA)', borderRadius: '8px', border: '1px solid var(--bbds-neutral-300, #EDEDED)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)' }}>
                  🧠 Análise de PD&I em andamento
                </span>
                <span style={{ fontSize: '12px', color: 'var(--bbds-neutral-600, #999)' }}>
                  {evaluationProgress.completed} de {evaluationProgress.total} analisadas
                  {evaluationProgress.completed < evaluationProgress.total && (
                    <> · ~{Math.ceil((evaluationProgress.total - evaluationProgress.completed) * 13 / 60)} min restantes</>
                  )}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--bbds-neutral-500, #aaa)', marginBottom: '8px' }}>
                A API de IA permite 5 requisições/min. Cada card é avaliado individualmente.
              </div>
              <div className="bbds-progress">
                <div 
                  className="bbds-progress-bar"
                  style={{ 
                    width: `${(evaluationProgress.completed / evaluationProgress.total) * 100}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Botão de retry para erros */}
          {!evaluationProgress.running && stats.errorCount > 0 && (
            <div style={{ marginBottom: '20px', padding: '16px', background: '#FFF8E1', borderRadius: '8px', border: '1px solid #FFD54F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#333' }}>
                ⚠️ {stats.errorCount} iniciativa(s) falharam na análise de IA.
              </span>
              <button 
                className="bbds-btn bbds-btn-secondary bbds-btn-sm"
                onClick={retryFailedEvaluations}
              >
                🔄 Tentar novamente
              </button>
            </div>
          )}

          {/* bb-summary-cards: Dashboard */}
          <div className="bbds-summary-grid">
            <div className="bbds-summary-card">
              <div className="bbds-summary-card-title">Total</div>
              <div className="bbds-summary-card-value">{stats.total}</div>
              <div className="bbds-summary-card-subtitle">{totalHistories} histórias</div>
            </div>

            <div className="bbds-summary-card bbds-summary-card--success">
              <div className="bbds-summary-card-title">Elegíveis</div>
              <div className="bbds-summary-card-value">{stats.eligible}</div>
              <div className="bbds-summary-card-subtitle">{stats.eligiblePercent}%</div>
              <div className="bbds-progress" style={{ marginTop: '8px' }}>
                <div className="bbds-progress-bar bbds-progress-bar--success" style={{ width: `${stats.eligiblePercent}%` }}></div>
              </div>
            </div>

            <div className="bbds-summary-card bbds-summary-card--error">
              <div className="bbds-summary-card-title">Não Elegíveis</div>
              <div className="bbds-summary-card-value">{stats.notEligible}</div>
              <div className="bbds-summary-card-subtitle">{stats.notEligiblePercent}%</div>
              <div className="bbds-progress" style={{ marginTop: '8px' }}>
                <div className="bbds-progress-bar bbds-progress-bar--error" style={{ width: `${stats.notEligiblePercent}%` }}></div>
              </div>
            </div>

            <div className="bbds-summary-card bbds-summary-card--warning">
              <div className="bbds-summary-card-title">Pendentes</div>
              <div className="bbds-summary-card-value">{stats.pendingAndAnalyzing}</div>
              <div className="bbds-summary-card-subtitle">{stats.pendingPercent}%</div>
            </div>

            {stats.errorCount > 0 && (
              <div className="bbds-summary-card" style={{ borderLeft: '4px solid var(--bbds-neutral-500, #666)' }}>
                <div className="bbds-summary-card-title">Erros</div>
                <div className="bbds-summary-card-value">{stats.errorCount}</div>
                <div className="bbds-summary-card-subtitle">{stats.errorPercent}%</div>
              </div>
            )}
          </div>

          {/* Grid de cards */}
          {isLoadingCards ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
              <div className="bbds-spinner bbds-spinner--lg"></div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)' }}>Buscando iniciativas...</p>
              <p style={{ fontSize: '13px', color: 'var(--bbds-neutral-600, #999)' }}>Os cards serão exibidos assim que chegarem</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="bbds-empty-state">
              <div className="bbds-empty-state-icon">📋</div>
              <div className="bbds-empty-state-title">Nenhuma iniciativa encontrada</div>
              <div className="bbds-empty-state-text">Tente ajustar os filtros para ver mais resultados</div>
            </div>
          ) : (
            <div className="bbds-cards-grid">
              {filteredCards.map((card) => (
                <CardComponent 
                  key={card.id} 
                  card={card} 
                  boardName={card.board_id ? boardNameMap.get(card.board_id) : undefined}
                  aiEvaluation={aiEvaluations.get(card.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;