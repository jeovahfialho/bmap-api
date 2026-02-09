import React, { useState, useMemo } from 'react';
import parse from 'html-react-parser';
import { ProcessedCard } from '../types/Card';
import { sanitizeHtml, generateSummary, stripHtml } from '../utils/textUtils';
import AIEvaluationModal from './AIEvaluationModal';
import ReportModal from './ReportModal';

interface CardProps {
  card: ProcessedCard;
  isChild?: boolean;
  boardName?: string;
}

const CardComponent: React.FC<CardProps> = ({ card, isChild = false, boardName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Mock de dados
  const generateMockData = (cardId: number) => {
    const scores = [8.5, 7.2, 9.1, 6.8, 8.9, 7.5, 9.3, 6.5];
    const score = scores[cardId % scores.length];
    
    // Responsáveis mock
    const owners = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Mendes'];
    const owner = owners[cardId % owners.length];
    
    // Criticidade mock
    const criticalities = [
      { level: 'high', label: 'Alta' },
      { level: 'medium', label: 'Média' },
      { level: 'low', label: 'Baixa' }
    ];
    const criticality = criticalities[cardId % criticalities.length];
    
    return { score, owner, criticality };
  };

  const mockData = !isChild ? generateMockData(card.id) : null;

  const getStatus = (score: number) => {
    if (score >= 8) return { label: 'Elegível', className: 'eligible' };
    if (score >= 6.5) return { label: 'Pendente', className: 'pending' };
    return { label: 'Não Elegível', className: 'not-eligible' };
  };

  const status = mockData ? getStatus(mockData.score) : null;

  // Extrai resumo da descrição
  const descriptionSummary = useMemo(() => {
    if (!card.description) return null;
    const summary = generateSummary(stripHtml(card.description), 120);
    return summary;
  }, [card.description]);

  // Mock de progresso (baseado no número de histórias)
  const progress = card.children ? Math.min((card.children.length / 10) * 100, 100) : Math.floor(Math.random() * 100);

  if (isChild) {
    return (
      <div className="child-initiative-card">
        <div className="child-card-header">
          <span className="child-card-id">#{card.id}</span>
          <h5 className="child-card-title">{card.title}</h5>
        </div>
        {card.description && (
          <p className="child-card-description">
            {generateSummary(stripHtml(card.description), 80)}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`initiative-card ${status?.className || ''}`}>
        <div className="initiative-header">
          <div className="initiative-id">#{card.id}</div>
          {status && (
            <span className={`status-badge status-${status.className}`}>
              {status.label}
            </span>
          )}
        </div>

        {boardName && (
          <div className="team-badge">{boardName}</div>
        )}

        <div className="initiative-title">{card.title}</div>

        <div className="initiative-meta">
          {mockData && (
            <>
              <div className="meta-item">
                <span className="meta-label">Criticidade</span>
                <span className={`meta-value criticality criticality-${mockData.criticality.level}`}>
                  {mockData.criticality.label}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Responsável</span>
                <span className="meta-value">{mockData.owner}</span>
              </div>
            </>
          )}
        </div>

        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-label">Progresso</span>
            <span className="progress-percentage">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="initiative-footer">
          <button 
            className="btn-details" 
            onClick={toggleExpanded}
          >
            Detalhes
          </button>
          
          {mockData && (
            <>
              <button 
                className="btn-ai-evaluate"
                onClick={() => setShowAIModal(true)}
              >
                Avaliar PD&I
              </button>
              <button 
                className="btn-report"
                onClick={() => setShowReportModal(true)}
              >
                Gerar Relatório
              </button>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="initiative-expanded">
            {card.description && (
              <div className="detail-section">
                <h4>Descrição</h4>
                <div className="detail-content">
                  {parse(sanitizeHtml(card.description))}
                </div>
              </div>
            )}

            {card.children && card.children.length > 0 && (
              <div className="detail-section">
                <h4>Histórias ({card.children.length})</h4>
                <div className="children-grid">
                  {card.children.map((child) => (
                    <CardComponent key={child.id} card={child} isChild={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AIEvaluationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        cardTitle={card.title}
        cardDescription={card.description || 'Sem descrição'}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        cardTitle={card.title}
        cardDescription={card.description || 'Sem descrição'}
      />
    </>
  );
};

export default CardComponent;
