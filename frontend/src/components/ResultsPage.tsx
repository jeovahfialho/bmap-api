import React from 'react';
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
  selectedBoard: Board;
  page: number;
  perPage: number;
  onBackToSearch: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ 
  cards, 
  selectedBoard, 
  page, 
  perPage, 
  onBackToSearch 
}) => {
  const totalHistories = cards.reduce((acc, card) => acc + card.children.length, 0);

  return (
    <div className="results-page">
      <div className="results-header">
        <div className="results-header-content">
          <button className="back-button" onClick={onBackToSearch}>
            ← Voltar para busca
          </button>
          <div className="results-info">
            <h2>📋 Resultados: {selectedBoard.name}</h2>
            <div className="results-stats">
              <span className="stat-item">📊 Página {page}</span>
              <span className="stat-item">🎯 {cards.length} iniciativas</span>
              <span className="stat-item">📚 {totalHistories} histórias</span>
              <span className="stat-item">⚙️ {perPage} por página</span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-content">
        {cards.length === 0 ? (
          <div className="empty-results">
            <p>🔍 Nenhuma iniciativa encontrada neste board.</p>
            <p>Tente ajustar os filtros ou selecionar outro board.</p>
          </div>
        ) : (
          <div className="cards-container-compact">
            {cards.map((card) => (
              <CardComponent key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      <div className="results-footer">
        <div className="results-summary">
          <strong>Board:</strong> ID {selectedBoard.board_id} - {selectedBoard.name}
        </div>
        <button className="back-button-footer" onClick={onBackToSearch}>
          🔙 Nova Busca
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;