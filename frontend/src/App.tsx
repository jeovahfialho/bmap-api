import React, { useState, useEffect } from 'react';
import CardComponent from './components/CardComponent';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import BoardSelection from './components/BoardSelection';
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

  const fetchBoards = async () => {
    console.log('[App] Iniciando busca de boards...');
    setBoardsLoading(true);
    
    try {
      const response = await fetch('/api/boards');
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
      } else {
        throw new Error('Resposta da API não foi bem-sucedida');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[App] useEffect executado - iniciando busca de boards...');
    fetchBoards();
  }, []);

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
          <ErrorMessage message={error} onRetry={() => selectedBoard ? fetchCards() : fetchBoards()} />
        ) : (
          <>
            <BoardSelection 
              boards={boards}
              selectedBoard={selectedBoard}
              onBoardSelect={setSelectedBoard}
              onSearch={fetchCards}
              loading={loading}
            />
            
            {loading && <LoadingSpinner />}
            
            {cards.length > 0 && (
              <div className="cards-container">
                {cards.map((card) => (
                  <CardComponent key={card.id} card={card} />
                ))}
              </div>
            )}
            
            {!loading && cards.length === 0 && selectedBoard && (
              <div className="empty-state">
                <p>Nenhuma iniciativa encontrada no board "{selectedBoard.name}".</p>
                <p>Tente ajustar os filtros ou selecionar outro board.</p>
              </div>
            )}
          </>
        )}
      </main>

      {cards.length > 0 && (
        <footer className="app-footer">
          <p>Board: {selectedBoard?.name}</p>
          <p>Total de iniciativas: {cards.length}</p>
          <p>Total de histórias: {cards.reduce((acc, card) => acc + card.children.length, 0)}</p>
        </footer>
      )}
    </div>
  );
};

export default App;