import React, { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import BoardSelection from './components/BoardSelection';
import ResultsPage from './components/ResultsPage';
import AIChat from './components/AIChat';
import { ProcessedCard } from './types/Card';
import { cardsService } from './services/cardsService';
import './App.css';

interface Board {
  board_id: number;
  name: string;
  description: string;
  is_archived: boolean;
}

const App: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Board[]>([]);
  const [cards, setCards] = useState<ProcessedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [pagination, setPagination] = useState<{all_pages: number, current_page: number, results_per_page: number} | null>(null);

  const fetchBoards = async () => {
    console.log('[App] Iniciando busca de boards...');
    setBoardsLoading(true);
    
    try {
      const response = await fetch('/api/cards/boards');
      
      // Verifica se a resposta é ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Pega o texto primeiro para debugar
      const text = await response.text();
      console.log('[App] Resposta raw (primeiros 200 chars):', text.substring(0, 200));
      
      // Tenta fazer parse
      const result = JSON.parse(text);
      
      if (result.success) {
        console.log(`[App] ${result.data.length} boards carregados`);
        setBoards(result.data);
      } else {
        throw new Error('Erro ao buscar boards');
      }
    } catch (err) {
      console.error('[App] Erro ao buscar boards:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar boards');
    } finally {
      console.log('[App] Finalizando busca de boards');
      setBoardsLoading(false);
    }
  };

  const fetchCards = async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      setShowResults(true); // Navega imediatamente para a tela de resultados
      const response = await cardsService.getInitiatives(filters);
      if (response.success) {
        setCards(response.data);
        if ('pagination' in response && response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination(null);
        }
      } else {
        throw new Error('Resposta da API não foi bem-sucedida');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setCards([]);
    setError(null);
  };

  useEffect(() => {
    console.log('[App] useEffect executado - iniciando busca de boards...');
    fetchBoards();
  }, []);

  // Se estiver mostrando resultados
  if (showResults && selectedBoards.length > 0) {
    if (error && cards.length === 0) {
      return <ErrorMessage message={error} onRetry={handleBackToSearch} />;
    }

    return (
      <ResultsPage
        cards={cards}
        selectedBoards={selectedBoards}
        pagination={pagination}
        onBackToSearch={handleBackToSearch}
        isLoadingCards={loading}
      />
    );
  }

  // Tela inicial de seleção
  return (
    <div className="App">
      {/* bb-navbar-header */}
      <header className="bbds-navbar">
        <div className="bbds-navbar-content">
          <div className="bbds-navbar-brand">
            <div className="bbds-navbar-logo">BB</div>
            <div>
              <div className="bbds-navbar-title">BusinessMap</div>
              <div className="bbds-navbar-subtitle">Iniciativas e Histórias</div>
            </div>
          </div>
          <div className="bbds-navbar-actions">
            <span className="bbds-tag bbds-tag--info" style={{ fontSize: '11px' }}>
              {boards.length} boards
            </span>
          </div>
        </div>
      </header>

      {/* bb-layout */}
      <div className="bbds-layout">
        <main className="bbds-layout-content">
          {boardsLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchBoards} />
          ) : (
            <BoardSelection 
              boards={boards}
              selectedBoards={selectedBoards}
              onBoardSelect={setSelectedBoards}
              onSearch={fetchCards}
              loading={loading}
            />
          )}

          {loading && <LoadingSpinner />}
        </main>
      </div>

      {/* Assistente IA */}
      <AIChat />
    </div>
  );
};

export default App;