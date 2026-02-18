import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '24px' }}>
      <div className="bbds-spinner bbds-spinner--lg"></div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--bbds-neutral-800, #333)', marginBottom: '4px' }}>
          Buscando dados das iniciativas...
        </p>
        <p style={{ fontSize: '14px', color: 'var(--bbds-neutral-600, #999)' }}>
          Isso pode demorar um pouco, aguarde.
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;