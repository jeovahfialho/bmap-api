import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando iniciativas...</p>
    </div>
  );
};

export default LoadingSpinner;