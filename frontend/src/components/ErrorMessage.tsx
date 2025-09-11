import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Erro ao carregar dados</h3>
      <p className="error-message">{message}</p>
      <button className="retry-button" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
};

export default ErrorMessage;