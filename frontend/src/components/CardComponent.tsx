import React from 'react';
import { ProcessedCard } from '../types/Card';

interface CardProps {
  card: ProcessedCard;
  isChild?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, isChild = false }) => {
  return (
    <div className={`card ${isChild ? 'child-card' : 'parent-card'}`}>
      <div className="card-header">
        <h3 className="card-title">{card.title}</h3>
        <span className={`card-type ${card.type}`}>
          {card.type === 'iniciativa' ? 'Iniciativa' : 'História'}
        </span>
      </div>
      
      <div className="card-content">
        <p className="card-description">{card.description || 'Sem descrição'}</p>
        <p className="card-id">ID: {card.id}</p>
      </div>

      {card.children && card.children.length > 0 && (
        <div className="children-container">
          <h4 className="children-title">Histórias ({card.children.length})</h4>
          <div className="children-list">
            {card.children.map((child) => (
              <CardComponent key={child.id} card={child} isChild={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComponent;