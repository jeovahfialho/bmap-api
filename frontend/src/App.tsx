import React, { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import BoardSelection from './components/BoardSelection';
import ResultsPage from './components/ResultsPage';
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
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
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
      const result = await response.json();
      
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
      const response = await cardsService.getInitiatives(filters);
      if (response.success) {
        setCards(response.data);
        if ('pagination' in response && response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination(null);
        }
        setShowResults(true);
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
  if (showResults && selectedBoard) {
    if (loading) {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return <ErrorMessage message={error} onRetry={handleBackToSearch} />;
    }

    return (
      <ResultsPage
        cards={cards}
        selectedBoard={selectedBoard}
        pagination={pagination}
        onBackToSearch={handleBackToSearch}
      />
    );
  }

  // Tela inicial de seleção
  return (
    <div className="App">
      <header className="app-header">
        <h1>BusinessMap - Iniciativas e Histórias</h1>
        <p>Visualização das iniciativas e suas histórias relacionadas</p>
      </header>

      <main className="app-main">
        {boardsLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchBoards} />
        ) : (
          <BoardSelection 
            boards={boards}
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
            onSearch={fetchCards}
            loading={loading}
          />
        )}

        {loading && <LoadingSpinner />}
      </main>
    </div>
  );
};

export default App;