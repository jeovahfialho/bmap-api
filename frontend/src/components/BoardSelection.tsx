import React, { useState } from 'react';
import parse from 'html-react-parser';

interface Board {
  board_id: number;
  name: string;
  description: string;
  is_archived: boolean;
}

interface BoardSelectionProps {
  boards: Board[];
  selectedBoard: Board | null;
  onBoardSelect: (board: Board | null) => void;
  onSearch: (filters: Record<string, any>) => void;
  loading: boolean;
}

const BoardSelection: React.FC<BoardSelectionProps> = ({ 
  boards, 
  selectedBoard, 
  onBoardSelect, 
  onSearch, 
  loading 
}) => {
  console.log(`[BoardSelection] ${boards.length} boards disponíveis`);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(200);

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const boardId = parseInt(e.target.value);
    
    if (boardId === 0) {
      onBoardSelect(null);
    } else {
      const board = boards.find(b => b.board_id === boardId);
      console.log(`[BoardSelection] Selecionado: ${board?.name}`);
      onBoardSelect(board || null);
    }
  };

  const handleSearch = () => {
    if (!selectedBoard) {
      alert('Por favor, selecione um board primeiro.');
      return;
    }

    const filters = {
      board_ids: [selectedBoard.board_id],
      page,
      per_page: perPage
    };
    
    console.log(`[BoardSelection] Buscando cards: ${selectedBoard.name}, página ${page}, ${perPage} por página`);
    onSearch(filters);
  };

  const activeBoards = boards.filter(b => !b.is_archived);
  const archivedBoards = boards.filter(b => b.is_archived);

  return (
    <div className="board-selection">
      <div className="board-selection-header">
        <h2>🔍 Buscar Iniciativas</h2>
        <p>Primeiro, selecione um board para visualizar suas iniciativas e histórias</p>
      </div>

      <div className="selection-form">
        <div className="form-group">
          <label htmlFor="board-select" className="form-label">
            📋 Selecione o Board:
          </label>
          <select 
            id="board-select"
            value={selectedBoard?.board_id || 0} 
            onChange={handleBoardChange}
            className="board-dropdown"
          >
            <option value={0}>-- Selecione um board --</option>
            
            {activeBoards.length > 0 && (
              <optgroup label="📌 Boards Ativos">
                {activeBoards.map(board => (
                  <option key={board.board_id} value={board.board_id}>
                    {board.name}
                  </option>
                ))}
              </optgroup>
            )}
            
            {archivedBoards.length > 0 && (
              <optgroup label="📦 Boards Arquivados">
                {archivedBoards.map(board => (
                  <option key={board.board_id} value={board.board_id}>
                    {board.name} (arquivado)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {selectedBoard && (
          <div className="search-options">
            <div className="options-row">
              <div className="form-group">
                <label htmlFor="page-input" className="form-label">
                  📄 Página:
                </label>
                <input
                  id="page-input"
                  type="number"
                  min="1"
                  value={page}
                  onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                  className="form-input small"
                />
              </div>

              <div className="form-group">
                <label htmlFor="per-page-select" className="form-label">
                  📊 Cards por página:
                </label>
                <select
                  id="per-page-select"
                  value={perPage}
                  onChange={(e) => setPerPage(parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
            </div>

            <div className="search-button-container">
              <button 
                className="search-button" 
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>🔄 Buscando...</>
                ) : (
                  <>🚀 Buscar Iniciativas</>
                )}
              </button>
            </div>

            <div className="selection-info">
              <div className="info-card">
                <strong>Board selecionado:</strong> {selectedBoard.name}
                <br />
                <strong>Configuração:</strong> Página {page}, {perPage} cards por página
                <br />
                <small>💡 Serão buscadas apenas iniciativas (tipo 2) e histórias (tipo 1)</small>
              </div>
            </div>
          </div>
        )}

        <div className="boards-info">
          <h3>📋 Boards Disponíveis</h3>
          
          {activeBoards.length > 0 && (
            <div className="board-group">
              <h4 className="board-group-title">📌 Boards Ativos ({activeBoards.length})</h4>
              <div className="boards-display">
                {activeBoards.map(board => (
                  <div key={board.board_id} className="board-item">
                    <div className="board-header">
                      <strong>ID {board.board_id}: {board.name}</strong>
                    </div>
                    <div className="board-description">
                      {board.description ? parse(board.description) : <em>Sem descrição</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {archivedBoards.length > 0 && (
            <div className="board-group">
              <h4 className="board-group-title">📦 Boards Arquivados ({archivedBoards.length})</h4>
              <div className="boards-display">
                {archivedBoards.map(board => (
                  <div key={board.board_id} className="board-item archived">
                    <div className="board-header">
                      <strong>ID {board.board_id}: {board.name}</strong>
                    </div>
                    <div className="board-description">
                      {board.description ? parse(board.description) : <em>Sem descrição</em>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardSelection;