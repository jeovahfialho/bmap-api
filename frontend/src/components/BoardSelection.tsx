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
      <div className="board-selection-header">
        <h2> Selecione os Boards</h2>
        <p>Busque e selecione os boards para visualizar suas iniciativas</p>
      </div>

      {selectedBoards.length > 0 && (
        <div className="selected-boards-section">
          <label className="section-label">
            Boards Selecionados ({selectedBoards.length})
          </label>
          <div className="boards-chips">
            {selectedBoards.map((board) => (
              <div key={board.board_id} className="board-chip">
                <span className="chip-content">
                  <span className="chip-id">{board.board_id}</span>
                  <span className="chip-name">{board.name}</span>
                </span>
                <button
                  className="chip-remove"
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

      <div className="search-section-v2">
        <label htmlFor="board-search" className="section-label">
          Buscar Boards
        </label>
        <div className="search-input-wrapper">
          <input
            id="board-search"
            type="text"
            placeholder="Digite o ID ou nome do board..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Limpar busca"
            >
              
            </button>
          )}
        </div>

        {searchTerm && filteredBoards.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              {filteredBoards.length} resultado(s) encontrado(s)
            </div>
            <div className="results-list">
              {filteredBoards.map((board) => {
                const isSelected = selectedBoards.some((b) => b.board_id === board.board_id);
                return (
                  <div
                    key={board.board_id}
                    className={`result-item ${isSelected ? 'selected' : ''} ${board.is_archived ? 'archived' : ''}`}
                    onClick={() => handleBoardClick(board)}
                  >
                    <div className="result-checkbox">
                      {isSelected && <span className="checkmark"></span>}
                    </div>
                    <div className="result-content">
                      <div className="result-id-name">
                        <span className="result-id">ID {board.board_id}</span>
                        <span className="result-name">{board.name}</span>
                      </div>
                      {board.is_archived && (
                        <span className="archive-badge">Arquivado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {searchTerm && filteredBoards.length === 0 && (
          <div className="no-results">
            <p>Nenhum board encontrado para "<strong>{searchTerm}</strong>"</p>
          </div>
        )}
      </div>

      {selectedBoards.length > 0 && (
        <div className="action-section">
          <button
            className="search-button-v2"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <> Buscando...</>
            ) : (
              <> Buscar Iniciativas dos {selectedBoards.length} Board(s)</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardSelection;
