import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">
        <p><strong>Buscando dados das iniciativas...</strong></p>
        <p className="loading-subtitle">Isso pode demorar um pouco, aguarde.</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;