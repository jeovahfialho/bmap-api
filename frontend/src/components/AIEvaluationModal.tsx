import React, { useState } from 'react';
import aiService from '../services/aiService';
import { stripHtml } from '../utils/textUtils';

interface AIEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTitle: string;
  cardDescription: string;
}

// Função para formatar a resposta da IA
const formatAIResponse = (response: string): JSX.Element => {
  // Trata quebras de linha
  const lines = response.split('\n');
  
  // Tenta extrair os campos estruturados
  const classificacaoMatch = response.match(/Classificação:\s*(.+?)(?=\n|$)/i);
  const indicacaoMatch = response.match(/Indicação de PD&I:\s*(.+?)(?=\n|$)/i);
  
  // Para justificativa e sugestão, usa uma abordagem diferente
  let justificativa = '';
  let sugestao = '';
  
  const justIndex = response.toLowerCase().indexOf('justificativa:');
  const sugestaoIndex = response.toLowerCase().indexOf('sugestão de melhoria:');
  
  if (justIndex !== -1 && sugestaoIndex !== -1) {
    justificativa = response.substring(justIndex + 14, sugestaoIndex).trim();
    sugestao = response.substring(sugestaoIndex + 22).trim();
  } else if (justIndex !== -1) {
    justificativa = response.substring(justIndex + 14).trim();
  } else if (sugestaoIndex !== -1) {
    sugestao = response.substring(sugestaoIndex + 22).trim();
  }

  if (classificacaoMatch || indicacaoMatch) {
    return (
      <div className="ai-response-formatted">
        {classificacaoMatch && (
          <div className="ai-field">
            <strong className="ai-field-label">Classificação</strong>
            <p className="ai-field-value">{classificacaoMatch[1].trim()}</p>
          </div>
        )}
        
        {indicacaoMatch && (
          <div className="ai-field">
            <strong className="ai-field-label">Indicação de PD&I</strong>
            <p className={`ai-field-value ${indicacaoMatch[1].trim().toLowerCase() === 'sim' ? 'positive' : 'negative'}`}>
              {indicacaoMatch[1].trim()}
            </p>
          </div>
        )}
        
        {justificativa && (
          <div className="ai-field">
            <strong className="ai-field-label">Justificativa</strong>
            <p className="ai-field-value">{justificativa}</p>
          </div>
        )}
        
        {sugestao && (
          <div className="ai-field">
            <strong className="ai-field-label">Sugestão de Melhoria</strong>
            <p className="ai-field-value suggestion">{sugestao}</p>
          </div>
        )}
      </div>
    );
  }

  // Se não conseguiu parsear, retorna o texto original
  return <div className="ai-response-plain">{response}</div>;
};

const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({
  isOpen,
  onClose,
  cardTitle,
  cardDescription,
}) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  React.useEffect(() => {
    if (isOpen && !response && !loading) {
      handleEvaluate();
    }
  }, [isOpen]);

  const handleEvaluate = async (prompt?: string) => {
    setLoading(true);
    setResponse('');

    try {
      // Remove HTML e envia apenas o texto limpo da descrição
      const cleanDescription = stripHtml(cardDescription).trim();
      
      // Se tem prompt customizado, adiciona antes da descrição
      const input = prompt 
        ? `${prompt}\n\n${cleanDescription}`
        : cleanDescription;
      
      console.log('[AIEvaluationModal] Enviando descrição limpa:', input);
      
      const aiResponse = await aiService.sendMessage(input);
      
      console.log('[AIEvaluationModal] Resposta recebida:', aiResponse);
      setResponse(aiResponse);
      setShowPromptInput(false);
      setCustomPrompt('');
    } catch (error: any) {
      console.error('[AIEvaluationModal] Erro ao avaliar com IA:', error);
      
      let errorMessage = 'Erro ao comunicar com a IA.\n\n';
      
      if (error.message) {
        errorMessage += `Detalhes: ${error.message}\n\n`;
      }
      
      errorMessage += 'Verifique:\n';
      errorMessage += '• Se a URL da API está correta\n';
      errorMessage += '• Se você tem acesso à rede interna\n';
      errorMessage += '• O console do navegador para mais detalhes';
      
      setResponse(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEvaluate = () => {
    if (customPrompt.trim()) {
      handleEvaluate(customPrompt.trim());
    }
  };

  const handleClose = () => {
    setResponse('');
    setShowPromptInput(false);
    setCustomPrompt('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Avaliação PD&I</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-card-info">
            {cardTitle}
          </div>

          {!loading && !response && !showPromptInput && (
            <div className="modal-loading">
              <p>Preparando avaliação...</p>
            </div>
          )}

          {loading && (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Avaliando...</p>
            </div>
          )}

          {!loading && response && (
            <div className="modal-response-section">
              <div className="modal-response-header">
                <h4>Resultado</h4>
                <button 
                  className="btn-new-evaluation"
                  onClick={() => setShowPromptInput(!showPromptInput)}
                  title="Criar avaliação personalizada"
                >
                  {showPromptInput ? 'Cancelar' : 'Nova Avaliação'}
                </button>
              </div>

              {showPromptInput && (
                <div className="custom-prompt-section">
                  <label htmlFor="custom-prompt">Prompt:</label>
                  <textarea
                    id="custom-prompt"
                    className="custom-prompt-input"
                    placeholder="Digite seu prompt personalizado..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                  <button
                    className="btn-evaluate-custom"
                    onClick={handleCustomEvaluate}
                    disabled={!customPrompt.trim()}
                  >
                    Avaliar
                  </button>
                </div>
              )}

              <div className="modal-response-content">
                {formatAIResponse(response)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEvaluationModal;
