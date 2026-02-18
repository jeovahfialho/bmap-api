import React, { useState } from 'react';
import parse from 'html-react-parser';
import { ProcessedCard, AIEvaluationResult, UserLoggedTime } from '../types/Card';
import { sanitizeHtml, generateSummary, stripHtml } from '../utils/textUtils';
import AIEvaluationModal from './AIEvaluationModal';
import ReportModal from './ReportModal';

// A API Businessmap retorna tempo logado em SEGUNDOS.
// Converte para horas e minutos para exibição.
const formatTime = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds === 0) return '0h';
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

interface CardProps {
  card: ProcessedCard;
  isChild?: boolean;
  boardName?: string;
  aiEvaluation?: AIEvaluationResult;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  eligible: { label: 'Elegível', className: 'eligible' },
  'not-eligible': { label: 'Não Elegível', className: 'not-eligible' },
  pending: { label: 'Pendente', className: 'pending' },
  analyzing: { label: 'Analisando...', className: 'analyzing' },
  error: { label: 'Erro', className: 'error' },
};

const CardComponent: React.FC<CardProps> = ({ card, isChild = false, boardName, aiEvaluation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const status = !isChild && aiEvaluation
    ? STATUS_MAP[aiEvaluation.status] || STATUS_MAP.pending
    : null;

  // Progresso baseado no número de histórias filhas
  const progress = card.children ? Math.min((card.children.length / 10) * 100, 100) : 0;

  if (isChild) {
    return (
      <div className="bbds-card bbds-card--highlight" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="bbds-tag bbds-tag--neutral">#{card.id}</span>
          <h5 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--bbds-neutral-800, #333)', margin: 0 }}>
            {card.title}
          </h5>
        </div>
        {card.description && (
          <p style={{ fontSize: '12px', color: 'var(--bbds-neutral-600, #999)', lineHeight: 1.4, margin: 0 }}>
            {generateSummary(stripHtml(card.description), 80)}
          </p>
        )}
        {/* Responsável do card filho */}
        {card.owner_name && (
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--bbds-neutral-600, #666)' }}>
            <span>👤 {card.owner_name}</span>
            {card.co_owner_names && card.co_owner_names.length > 0 && (
              <span style={{ marginLeft: '8px' }}>
                👥 {card.co_owner_names.join(', ')}
              </span>
            )}
          </div>
        )}
        {/* Tempo logado no card filho */}
        {card.logged_times_by_user && card.logged_times_by_user.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--bbds-neutral-600, #666)' }}>
            <span style={{ fontWeight: 600 }}>⏱ {formatTime(card.total_logged_time || 0)}</span>
            <span style={{ marginLeft: '8px' }}>
              ({card.logged_times_by_user.map(u => `${u.user_name || `User ${u.user_id}`}: ${formatTime(u.total_time)}`).join(', ')})
            </span>
          </div>
        )}
      </div>
    );
  }

  // Determina classe de status do card
  const statusCardClass = status?.className === 'eligible' ? 'bbds-card--status-success' 
    : status?.className === 'pending' ? 'bbds-card--status-warning'
    : status?.className === 'analyzing' ? 'bbds-card--status-warning'
    : status?.className === 'error' ? 'bbds-card--status-error'
    : status?.className === 'not-eligible' ? 'bbds-card--status-error'
    : '';

  return (
    <>
      {/* bb-card */}
      <div className={`bbds-card ${statusCardClass}`}>
        {/* Card Header */}
        <div className="bbds-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="bbds-text-xs bbds-text-muted">#{card.id}</span>
            {boardName && (
              <span className="bbds-tag bbds-tag--info">{boardName}</span>
            )}
          </div>
          {status && (
            <span className={`bbds-tag ${
              status.className === 'eligible' ? 'bbds-tag--success' 
              : status.className === 'pending' ? 'bbds-tag--warning'
              : status.className === 'analyzing' ? 'bbds-tag--warning'
              : 'bbds-tag--error'
            }`}>
              {aiEvaluation?.status === 'analyzing' && '⏳ '}
              {status.label}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="bbds-card-body">
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '12px', lineHeight: 1.3 }}>
            {card.title}
          </h3>

          {/* Responsável e Co-owners */}
          <div style={{ marginBottom: '12px' }}>
            {card.owner_name && (
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">👤 Responsável</span>
                <span className="bbds-content-line-value" style={{ fontWeight: 500 }}>{card.owner_name}</span>
              </div>
            )}
            {card.co_owner_names && card.co_owner_names.length > 0 && (
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">👥 Co-responsáveis</span>
                <span className="bbds-content-line-value">
                  {card.co_owner_names.map((name, idx) => (
                    <span key={idx} className="bbds-tag bbds-tag--neutral" style={{ marginRight: '4px', marginBottom: '2px', fontSize: '11px' }}>
                      {name}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {card.first_start_time && (
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">📅 Início</span>
                <span className="bbds-content-line-value">
                  {new Date(card.first_start_time).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* bb-content-line: Metadados da IA */}
          {aiEvaluation && aiEvaluation.status !== 'analyzing' && aiEvaluation.status !== 'error' && (
            <div style={{ marginBottom: '12px' }}>
              {aiEvaluation.classification && (
                <div className="bbds-content-line">
                  <span className="bbds-content-line-label">Classificação IA</span>
                  <span className="bbds-content-line-value">{aiEvaluation.classification}</span>
                </div>
              )}
              {aiEvaluation.pdiIndication && (
                <div className="bbds-content-line">
                  <span className="bbds-content-line-label">Indicação PD&I</span>
                  <span className={`bbds-tag ${
                    aiEvaluation.pdiIndication.toLowerCase().startsWith('sim') ? 'bbds-tag--success' : 'bbds-tag--error'
                  }`}>
                    {aiEvaluation.pdiIndication}
                  </span>
                </div>
              )}
            </div>
          )}

          {aiEvaluation?.status === 'error' && (
            <div style={{ marginBottom: '12px' }}>
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">Avaliação IA</span>
                <span className="bbds-tag bbds-tag--error">Falha na análise</span>
              </div>
            </div>
          )}

          {/* bb-progress-bar */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="bbds-text-xs bbds-text-muted">Progresso</span>
              <span className="bbds-text-xs bbds-text-bold">{Math.round(progress)}%</span>
            </div>
            <div className="bbds-progress">
              <div 
                className={`bbds-progress-bar ${
                  progress >= 75 ? 'bbds-progress-bar--success' 
                  : progress >= 40 ? '' 
                  : 'bbds-progress-bar--warning'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Resumo de horas e equipe */}
          {card.logged_times_by_user && card.logged_times_by_user.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">⏱ Tempo Total</span>
                <span className="bbds-content-line-value" style={{ fontWeight: 600 }}>
                  {formatTime(card.total_logged_time || 0)}
                </span>
              </div>
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">👥 Equipe</span>
                <span className="bbds-content-line-value">
                  {card.logged_times_by_user.slice(0, 3).map(u => u.user_name || `User ${u.user_id}`).join(', ')}
                  {card.logged_times_by_user.length > 3 && ` +${card.logged_times_by_user.length - 3}`}
                </span>
              </div>
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">📊 Histórias</span>
                <span className="bbds-content-line-value">{card.children?.length || 0}</span>
              </div>
            </div>
          )}
          {(!card.logged_times_by_user || card.logged_times_by_user.length === 0) && (
            <div style={{ marginTop: '8px' }}>
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">📊 Histórias</span>
                <span className="bbds-content-line-value">{card.children?.length || 0}</span>
              </div>
              <div className="bbds-content-line">
                <span className="bbds-content-line-label">⏱ Tempo Total</span>
                <span className="bbds-content-line-value" style={{ color: 'var(--bbds-neutral-500, #999)' }}>Sem registro</span>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: bb-button group */}
        <div className="bbds-card-footer">
          <button 
            className="bbds-btn bbds-btn-tertiary bbds-btn-sm"
            onClick={toggleExpanded}
          >
            {isExpanded ? '▲ Recolher' : '▼ Detalhes'}
          </button>
          
          <button 
            className="bbds-btn bbds-btn-secondary bbds-btn-sm"
            onClick={() => setShowAIModal(true)}
          >
            Avaliar PD&I
          </button>
          <button 
            className="bbds-btn bbds-btn-primary bbds-btn-sm"
            onClick={() => setShowReportModal(true)}
          >
            Relatório
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--bbds-neutral-300, #EDEDED)', background: 'var(--bbds-surface-highlight, #F7F7F7)' }}>
            {/* Funcionários e Tempo Alocado */}
            {card.logged_times_by_user && card.logged_times_by_user.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '8px' }}>
                  👥 Funcionários e Tempo Alocado ({formatTime(card.total_logged_time || 0)} total)
                </h4>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {card.logged_times_by_user.map((userTime) => (
                    <div 
                      key={userTime.user_id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '8px 12px', 
                        background: 'var(--bbds-surface-default, #fff)', 
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--bbds-primary-500, #005AA5)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--bbds-neutral-800, #333)' }}>
                          {userTime.user_name || `User ${userTime.user_id}`}
                        </span>
                        <span className="bbds-tag bbds-tag--neutral" style={{ fontSize: '10px' }}>
                          ID: {userTime.user_id}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--bbds-neutral-600, #666)' }}>
                          {userTime.entries_count} registro{userTime.entries_count !== 1 ? 's' : ''}
                        </span>
                        <span className="bbds-tag bbds-tag--info" style={{ fontWeight: 600 }}>
                          {formatTime(userTime.total_time)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sem tempo logado */}
            {(!card.logged_times_by_user || card.logged_times_by_user.length === 0) && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '8px' }}>
                  👥 Funcionários e Tempo Alocado
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--bbds-neutral-500, #999)', fontStyle: 'italic', margin: 0 }}>
                  Nenhum tempo logado nesta iniciativa.
                </p>
              </div>
            )}

            {/* Justificativa da IA */}
            {aiEvaluation?.justification && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '8px' }}>Justificativa (IA)</h4>
                <div style={{ fontSize: '13px', color: 'var(--bbds-neutral-700, #666)', lineHeight: 1.5, padding: '8px', background: 'var(--bbds-surface-default, #fff)', borderRadius: '4px', borderLeft: '3px solid var(--bbds-primary-500, #005AA5)' }}>
                  <p style={{ margin: 0 }}>{aiEvaluation.justification}</p>
                </div>
              </div>
            )}

            {/* Sugestão da IA */}
            {aiEvaluation?.suggestion && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '8px' }}>Sugestão de Melhoria (IA)</h4>
                <div style={{ fontSize: '13px', color: 'var(--bbds-neutral-700, #666)', lineHeight: 1.5, padding: '8px', background: 'var(--bbds-surface-default, #fff)', borderRadius: '4px', borderLeft: '3px solid var(--bbds-warning-500, #F5A623)' }}>
                  <p style={{ margin: 0 }}>{aiEvaluation.suggestion}</p>
                </div>
              </div>
            )}

            {card.description && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '8px' }}>Descrição</h4>
                <div style={{ fontSize: '13px', color: 'var(--bbds-neutral-700, #666)', lineHeight: 1.5 }}>
                  {parse(sanitizeHtml(card.description))}
                </div>
              </div>
            )}

            {card.children && card.children.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '8px' }}>
                  Histórias ({card.children.length})
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
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
