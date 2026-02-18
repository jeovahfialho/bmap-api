import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const isRateLimitError = message.includes('limite de requisições') || message.includes('temporariamente indisponível');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px', padding: '32px' }}>
      <div style={{ fontSize: '48px' }}>{isRateLimitError ? '⏱️' : '⚠️'}</div>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)' }}>
        {isRateLimitError ? 'Serviço Temporariamente Indisponível' : 'Erro ao carregar dados'}
      </h3>
      <div className="bbds-inline-message bbds-inline-message--error" style={{ maxWidth: '500px' }}>
        {isRateLimitError 
          ? 'O sistema está com muitas requisições no momento. Tente novamente em alguns minutos.'
          : message
        }
      </div>
      <button className="bbds-btn bbds-btn-primary" onClick={onRetry}>
        Tentar novamente
      </button>
      {isRateLimitError && (
        <div className="bbds-inline-message bbds-inline-message--info" style={{ maxWidth: '400px', marginTop: '8px' }}>
          💡 Aguarde alguns minutos antes de tentar novamente para melhores resultados.
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;