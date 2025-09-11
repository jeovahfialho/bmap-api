import React, { useState, useEffect } from 'react';
import CardComponent from './components/CardComponent';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import FiltersPanel from './components/FiltersPanel';
import { ProcessedCard } from './types/Card';
import { cardsService } from './services/cardsService';
import './App.css';

const App: React.FC = () => {
  const [cards, setCards] = useState<ProcessedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchCards();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCards} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>BusinessMap - Iniciativas e Histórias</h1>
        <p>Visualização das iniciativas e suas histórias relacionadas</p>
      </header>

      <main className="app-main">
        <FiltersPanel onApplyFilters={fetchCards} loading={loading} />
        
        {cards.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma iniciativa encontrada.</p>
          </div>
        ) : (
          <div className="cards-container">
            {cards.map((card) => (
              <CardComponent key={card.id} card={card} />
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Total de iniciativas: {cards.length}</p>
        <p>Total de histórias: {cards.reduce((acc, card) => acc + card.children.length, 0)}</p>
      </footer>
    </div>
  );
};

export default App;