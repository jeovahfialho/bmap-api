import React, { useState } from 'react';
import parse from 'html-react-parser';
import { ProcessedCard } from '../types/Card';

interface CardProps {
  card: ProcessedCard;
  isChild?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, isChild = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`card-compact ${isChild ? 'child-card-compact' : 'parent-card-compact'}`}>
      <div className="card-header-compact">
        <div className="card-title-row">
          <h4 className="card-title-compact">{card.title}</h4>
          <div className="card-actions">
            <span className={`card-type-compact ${card.type}`}>
              {card.type === 'iniciativa' ? 'Iniciativa' : 'História'}
            </span>
            <button 
              className="expand-button"
              onClick={toggleExpanded}
              aria-label={isExpanded ? 'Recolher' : 'Expandir'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
        <span className="card-id-compact">ID: {card.id}</span>
      </div>
      
      {isExpanded && (
        <div className="card-content-expanded">
          <div className="card-description-compact">
            {card.description ? parse(card.description) : <p>Sem descrição</p>}
          </div>

          {card.children && card.children.length > 0 && (
            <div className="children-container-compact">
              <h5 className="children-title-compact">📚 {card.children.length} Histórias</h5>
              <div className="children-list-compact">
                {card.children.map((child) => (
                  <CardComponent key={child.id} card={child} isChild={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardComponent;