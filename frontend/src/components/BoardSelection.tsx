import React, { useState, useMemo } from 'react';

interface Board {
  board_id: number;
  name: string;
  description: string;
  is_archived: boolean;
}

interface BoardSelectionProps {
  boards: Board[];
  selectedBoards: Board[];
  onBoardSelect: (boards: Board[]) => void;
  onSearch: (filters: Record<string, any>) => void;
  loading: boolean;
}

const BoardSelection: React.FC<BoardSelectionProps> = ({
  boards,
  selectedBoards,
  onBoardSelect,
  onSearch,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBoards = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return boards.filter(
      (board) =>
        board.board_id.toString().includes(term) ||
        board.name.toLowerCase().includes(term)
    );
  }, [searchTerm, boards]);

  const handleBoardClick = (board: Board) => {
    const isSelected = selectedBoards.some((b) => b.board_id === board.board_id);
    let newSelection: Board[];
    
    if (isSelected) {
      newSelection = selectedBoards.filter((b) => b.board_id !== board.board_id);
    } else {
      // Limitar a no máximo 3 boards selecionados
      if (selectedBoards.length >= 3) {
        alert('⚠️ Você pode selecionar no máximo 3 boards por vez.');
        return;
      }
      newSelection = [...selectedBoards, board];
    }
    
    onBoardSelect(newSelection);
    setSearchTerm('');
  };

  const handleRemoveBoard = (boardId: number) => {
    const newSelection = selectedBoards.filter((b) => b.board_id !== boardId);
    onBoardSelect(newSelection);
  };

  const handleSearch = () => {
    if (selectedBoards.length === 0) {
      alert('Por favor, selecione pelo menos um board.');
      return;
    }

    const filters = {
      board_ids: selectedBoards.map((b) => b.board_id),
    };

    console.log('[BoardSelection] Buscando cards dos boards:', selectedBoards.map((b) => b.name).join(', '));
    onSearch(filters);
  };

  return (
    <div className="board-selection-v2">
      {/* bb-section-title */}
      <div className="bbds-section-title">
        <h2>Selecione os Boards</h2>
        <p>Busque e selecione até 3 boards para visualizar suas iniciativas</p>
      </div>

      {/* bb-selectable-card chips */}
      {selectedBoards.length > 0 && (
        <div style={{ marginBottom: 'var(--bbds-spacing-lg, 24px)' }}>
          <label className="bbds-field-label">
            Boards Selecionados ({selectedBoards.length}/3)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {selectedBoards.map((board) => (
              <div key={board.board_id} className="bbds-selectable-chip bbds-selectable-chip--selected">
                <span style={{ fontWeight: 600, fontSize: '11px', opacity: 0.8 }}>
                  {board.board_id}
                </span>
                <span>{board.name}</span>
                <button
                  className="bbds-chip-remove"
                  onClick={() => handleRemoveBoard(board.board_id)}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* bb-search-field */}
      <div className="bbds-field">
        <label htmlFor="board-search" className="bbds-field-label">
          Buscar Boards
        </label>
        <div style={{ position: 'relative' }}>
          <span className="bbds-field-search-icon">🔍</span>
          <input
            id="board-search"
            type="text"
            placeholder="Digite o ID ou nome do board..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bbds-field-input bbds-field-input--search"
          />
          {searchTerm && (
            <button
              className="bbds-icon-action"
              onClick={() => setSearchTerm('')}
              title="Limpar busca"
              style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Resultados da busca */}
        {searchTerm && filteredBoards.length > 0 && (
          <div className="bbds-card" style={{ marginTop: '8px', maxHeight: '300px', overflow: 'auto' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--bbds-neutral-300, #EDEDED)', fontSize: '12px', color: 'var(--bbds-neutral-600, #999)' }}>
              {filteredBoards.length} resultado(s) encontrado(s)
            </div>
            {filteredBoards.map((board) => {
              const isSelected = selectedBoards.some((b) => b.board_id === board.board_id);
              return (
                <div
                  key={board.board_id}
                  className="search-result-item"
                  onClick={() => handleBoardClick(board)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: '1px solid var(--bbds-neutral-300, #EDEDED)',
                    background: isSelected ? 'var(--bbds-info-light, #E3F2FD)' : 'transparent',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--bbds-surface-highlight, #F7F7F7)')}
                  onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '4px',
                    border: isSelected ? '2px solid var(--bbds-brand-primary, #003882)' : '2px solid var(--bbds-neutral-400, #DEDEDE)',
                    background: isSelected ? 'var(--bbds-brand-primary, #003882)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '12px', flexShrink: 0,
                  }}>
                    {isSelected && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="bbds-tag bbds-tag--neutral" style={{ fontSize: '11px' }}>
                        ID {board.board_id}
                      </span>
                      <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--bbds-neutral-800, #333)' }}>
                        {board.name}
                      </span>
                    </div>
                  </div>
                  {board.is_archived && (
                    <span className="bbds-tag bbds-tag--warning" style={{ fontSize: '10px' }}>
                      Arquivado
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {searchTerm && filteredBoards.length === 0 && (
          <div className="bbds-inline-message bbds-inline-message--info" style={{ marginTop: '8px' }}>
            Nenhum board encontrado para "<strong>{searchTerm}</strong>"
          </div>
        )}
      </div>

      {/* bb-button: Ação principal */}
      {selectedBoards.length > 0 && (
        <div style={{ marginTop: 'var(--bbds-spacing-lg, 24px)', textAlign: 'center' }}>
          <button
            className="bbds-btn bbds-btn-primary bbds-btn-lg"
            onClick={handleSearch}
            disabled={loading}
            style={{ minWidth: '280px' }}
          >
            {loading ? (
              <>
                <div className="bbds-spinner bbds-spinner--sm" style={{ borderTopColor: 'white' }}></div>
                Buscando...
              </>
            ) : (
              <>Buscar Iniciativas dos {selectedBoards.length} Board(s)</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardSelection;
