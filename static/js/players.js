import { players, fetchPlayers } from './api.js';
import { getMathShape } from './config.js';
import { getCell } from './board.js';

// Update score table with current data
function updateScoreTable() {
  players.forEach(player => {
    const row = document.querySelector(`#score-table tr[data-player-id="${player.id}"]`);
    if (row) {
      row.querySelector('.player-result').textContent = player.result;
    }
  });
}

// Generate pawns dynamically
function renderPawns() {
  const pawnContainer = document.querySelector('.pawns');
  pawnContainer.innerHTML = '';
  
  players.forEach(player => {
    const pawn = document.createElement('div');
    pawn.classList.add('pawn');
    pawn.setAttribute('data-player-id', player.id);
    pawn.setAttribute('data-position', player.result);
    pawn.style.backgroundColor = player.color;
    pawn.style.clipPath = getMathShape(player.shape);
    
    const playerName = document.createElement('span');
    playerName.textContent = player.name;
    playerName.style.color = 'white';
    playerName.style.position = 'absolute';
    playerName.style.width = '100%';
    playerName.style.textAlign = 'center';
    playerName.style.top = '50%';
    playerName.style.transform = 'translateY(-50%)';
    
    pawn.appendChild(playerName);
    pawnContainer.appendChild(pawn);
    updatePawnPosition(pawn, player.result);
  });
}

// Update all pawns positions based on database data
async function initializePawns() {
  const currentPlayers = await fetchPlayers();
  updateScoreTable();
  renderPawns();
  
  const pawns = document.querySelectorAll('.pawn');
  
  pawns.forEach((pawn) => {
    const playerId = pawn.getAttribute('data-player-id');
    const player = currentPlayers.find(p => p.id == playerId);
    
    if (player) {
      // Calculate position based on player's result (1 point = 1 position)
      const position = Math.min(player.result, getPathLength() - 1);
      pawn.setAttribute('data-position', position);
      updatePawnPosition(pawn, position);
    }
  });
}

// Update pawn position
function updatePawnPosition(pawn, position) {
  const cell = getCell(position);
  if (!cell) return;
  
  const pawnsInCell = Array.from(document.querySelectorAll('.pawn')).filter(p => 
    parseInt(p.getAttribute('data-position')) === position
  );
  
  const offsetX = parseInt(cell.style.left);
  const offsetY = parseInt(cell.style.top);
  const cellWidth = 60;
  const cellHeight = 60;
  
  // Adjust for multiple pawns in the same cell
  const offset = 2;
  // Added minimum size of 15px
  const pawnSize = Math.max(18, Math.min(40, (cellWidth - (pawnsInCell.length - 1) * offset) / pawnsInCell.length));
  
  const index = pawnsInCell.indexOf(pawn);
  
  pawn.style.width = `${pawnSize}px`;
  pawn.style.height = `${pawnSize}px`;
  pawn.style.left = `${offsetX + cellWidth / 2 - pawnSize / 2 + 
    (index - (pawnsInCell.length - 1) / 2) * (pawnSize + offset)}px`;
  pawn.style.top = `${offsetY + cellHeight / 2 - pawnSize / 2}px`;
}
// Get the total length of the path
function getPathLength() {
  return 51; // Based on pathCoordinates length
}

// Reset all pawns to starting position
function resetPawns() {
  const pawns = document.querySelectorAll('.pawn');
  pawns.forEach((pawn) => {
    pawn.setAttribute('data-position', 0);
    updatePawnPosition(pawn, 0);
    pawn.style.width = '40px';
    pawn.style.height = '40px';
  });
}

export { 
  updateScoreTable, 
  renderPawns, 
  initializePawns, 
  updatePawnPosition, 
  getPathLength,
  resetPawns
};
