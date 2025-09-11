import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const isRateLimitError = message.includes('limite de requisições') || message.includes('temporariamente indisponível');
  
  return (
    <div className="error-container">
      <div className="error-icon">{isRateLimitError ? '⏱️' : '⚠️'}</div>
      <h3>{isRateLimitError ? 'Serviço Temporariamente Indisponível' : 'Erro ao carregar dados'}</h3>
      <p className="error-message">
        {isRateLimitError 
          ? 'O sistema está com muitas requisições no momento. Tente novamente em alguns minutos.'
          : message
        }
      </p>
      <button className="retry-button" onClick={onRetry}>
        Tentar novamente
      </button>
      {isRateLimitError && (
        <p className="error-hint">
          💡 Aguarde alguns minutos antes de tentar novamente para melhores resultados.
        </p>
      )}
    </div>
  );
};

export default ErrorMessage;