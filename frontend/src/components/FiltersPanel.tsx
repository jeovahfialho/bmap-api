import React, { useState, useEffect } from 'react';

interface Board {
  board_id: number;
  name: string;
  is_archived: boolean;
}

interface FiltersPanelProps {
  onApplyFilters: (filters: Record<string, any>) => void;
  loading: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onApplyFilters, loading }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(200);
  const [boardsLoading, setBoardsLoading] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setBoardsLoading(true);
    try {
      const response = await fetch('/api/boards');
      const result = await response.json();
      if (result.success) {
        setBoards(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar boards:', error);
    }
    setBoardsLoading(false);
  };

  const handleBoardChange = (boardId: number, checked: boolean) => {
    if (checked) {
      setSelectedBoardIds([...selectedBoardIds, boardId]);
    } else {
      setSelectedBoardIds(selectedBoardIds.filter(id => id !== boardId));
    }
  };

  const handleSelectAllBoards = () => {
    setSelectedBoardIds(boards.map(b => b.board_id));
  };

  const handleClearAllBoards = () => {
    setSelectedBoardIds([]);
  };

  const handleApplyFilters = () => {
    const filters: Record<string, any> = {
      page,
      per_page: perPage
    };

    if (selectedBoardIds.length > 0) {
      filters.board_ids = selectedBoardIds;
    }

    onApplyFilters(filters);
  };

  const activeBoards = boards.filter(b => !b.is_archived);
  const archivedBoards = boards.filter(b => b.is_archived);

  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h3>Filtros</h3>
      </div>

      <div className="filter-section">
        <label className="filter-label">Boards</label>
        {boardsLoading ? (
          <p className="loading-text">Carregando boards...</p>
        ) : (
          <>
            <div className="board-actions">
              <button 
                type="button" 
                className="filter-action-btn" 
                onClick={handleSelectAllBoards}
              >
                Selecionar Todos
              </button>
              <button 
                type="button" 
                className="filter-action-btn" 
                onClick={handleClearAllBoards}
              >
                Limpar Seleção
              </button>
            </div>

            {activeBoards.length > 0 && (
              <div className="board-group">
                <h4 className="board-group-title">Ativos</h4>
                <div className="board-list">
                  {activeBoards.map(board => (
                    <label key={board.board_id} className="board-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedBoardIds.includes(board.board_id)}
                        onChange={(e) => handleBoardChange(board.board_id, e.target.checked)}
                      />
                      <span className="board-name">{board.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {archivedBoards.length > 0 && (
              <div className="board-group">
                <h4 className="board-group-title">Arquivados</h4>
                <div className="board-list">
                  {archivedBoards.map(board => (
                    <label key={board.board_id} className="board-checkbox archived">
                      <input
                        type="checkbox"
                        checked={selectedBoardIds.includes(board.board_id)}
                        onChange={(e) => handleBoardChange(board.board_id, e.target.checked)}
                      />
                      <span className="board-name">{board.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="filter-section">
        <label className="filter-label">Página</label>
        <input
          type="number"
          min="1"
          value={page}
          onChange={(e) => setPage(parseInt(e.target.value) || 1)}
          className="filter-input"
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Por Página</label>
        <select
          value={perPage}
          onChange={(e) => setPerPage(parseInt(e.target.value))}
          className="filter-select"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
      </div>

      <div className="filter-actions">
        <button 
          className="apply-filters-btn" 
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Aplicar'}
        </button>
      </div>

      <div className="filter-info">
        <p><strong>Selecionados:</strong> {selectedBoardIds.length}</p>
        <p><strong>Página:</strong> {page}</p>
        <p><strong>Por página:</strong> {perPage}</p>
      </div>
    </div>
  );
};

export default FiltersPanel;